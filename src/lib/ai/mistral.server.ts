import { generateOutputSchema, type GenerateOutput } from "@/lib/validation/generation";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = "pixtral-large-latest";
// 55 s — 5 s headroom below Vercel Hobby's 60 s function limit
const TIMEOUT_MS = 55_000;

export class AiError extends Error {
  constructor(
    public code:
      "MISSING_API_KEY" | "AI_TIMEOUT" | "RATE_LIMITED" | "AI_INVALID_RESPONSE" | "SERVER_ERROR",
    message: string,
  ) {
    super(message);
  }
}

type ChatContent = { type: "text"; text: string } | { type: "image_url"; image_url: string };

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatContent[];
}

async function callMistral(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new AiError("MISSING_API_KEY", "MISTRAL_API_KEY is not configured");
  const model = process.env.MISTRAL_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(MISTRAL_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 6000,
        response_format: { type: "json_object" },
        messages,
      }),
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new AiError("AI_TIMEOUT", "AI request timed out");
    }
    throw new AiError("SERVER_ERROR", "Failed to reach AI provider");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) throw new AiError("RATE_LIMITED", "Rate limit exceeded");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Mistral error", res.status, body.slice(0, 500));
    throw new AiError("SERVER_ERROR", `AI provider returned ${res.status}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AiError("AI_INVALID_RESPONSE", "Empty AI response");
  return content;
}

function extractJsonBlob(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return s;
  return s.slice(first, last + 1);
}

function tryParse(raw: string): GenerateOutput | null {
  try {
    const obj = JSON.parse(extractJsonBlob(raw));
    const parsed = generateOutputSchema.safeParse(obj);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function repairJson(broken: string): Promise<string> {
  return callMistral([
    {
      role: "system",
      content:
        "You are a strict JSON repair tool. Return only valid JSON that matches the previous schema (html, css, javascript, explanation, accessibilityNotes, responsiveNotes, assumptions, warnings). No prose, no fences.",
    },
    {
      role: "user",
      content: `Repair this into valid JSON only:\n\n${broken.slice(0, 20_000)}`,
    },
  ]);
}

export async function mistralGenerate(args: {
  imageBase64: string;
  mimeType: string;
  systemPrompt: string;
  userInstructions: string;
}): Promise<GenerateOutput> {
  const dataUrl = `data:${args.mimeType};base64,${args.imageBase64.replace(/\s+/g, "")}`;
  const raw = await callMistral([
    { role: "system", content: args.systemPrompt },
    {
      role: "user",
      content: [
        { type: "text", text: args.userInstructions },
        { type: "image_url", image_url: dataUrl },
      ],
    },
  ]);
  const parsed = tryParse(raw);
  if (parsed) return parsed;
  const repaired = await repairJson(raw);
  const parsed2 = tryParse(repaired);
  if (parsed2) return parsed2;
  throw new AiError("AI_INVALID_RESPONSE", "AI returned malformed JSON");
}

export async function mistralRefine(args: {
  systemPrompt: string;
  refinementPrompt: string;
}): Promise<GenerateOutput> {
  const raw = await callMistral([
    { role: "system", content: args.systemPrompt },
    { role: "user", content: args.refinementPrompt },
  ]);
  const parsed = tryParse(raw);
  if (parsed) return parsed;
  const repaired = await repairJson(raw);
  const parsed2 = tryParse(repaired);
  if (parsed2) return parsed2;
  throw new AiError("AI_INVALID_RESPONSE", "AI returned malformed JSON");
}
