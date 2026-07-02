import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

import { parseGenerateOutput } from "@/lib/ai/json-output";
import type { GenerateOutput } from "@/lib/validation/generation";

const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";
const DEFAULT_MODEL = "pixtral-large-latest";
const DEFAULT_OCR_MODEL = "mistral-ocr-latest";
const DEFAULT_MAX_TOKENS = 3500;
// Keep headroom below the typical serverless hard timeout while still allowing OCR + synthesis.
const DEFAULT_TIMEOUT_MS = 55_000;
const MAX_TIMEOUT_MS = 58_000;

export class AiError extends Error {
  constructor(
    public code:
      | "MISSING_API_KEY"
      | "MISSING_BLOB_TOKEN"
      | "BLOB_UPLOAD_FAILED"
      | "AI_AUTH_ERROR"
      | "AI_TIMEOUT"
      | "RATE_LIMITED"
      | "AI_INVALID_RESPONSE"
      | "JSON_REPAIR_FAILED"
      | "SERVER_ERROR",
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

interface ChatOptions {
  modelOverride?: string;
  temperature?: number;
  maxTokens?: number;
}

interface OcrResponse {
  pages?: Array<{
    index?: number;
    markdown?: string;
  }>;
}

function readIntEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(max, Math.max(min, parsed));
}

function mimeTypeToExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

async function uploadImageToBlob(imageBase64: string, mimeType: string): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new AiError("MISSING_BLOB_TOKEN", "BLOB_READ_WRITE_TOKEN is not configured");
  }

  const body = Buffer.from(imageBase64.replace(/\s+/g, ""), "base64");
  const extension = mimeTypeToExtension(mimeType);
  const key = `ocr-inputs/${randomUUID()}.${extension}`;
  let blob: { url: string };
  try {
    blob = await put(key, body, {
      access: "public",
      addRandomSuffix: false,
      contentType: mimeType,
      token,
    });
  } catch (err) {
    console.error("Blob upload failed", {
      name: (err as { name?: string })?.name,
      message: (err as { message?: string })?.message,
    });
    throw new AiError("BLOB_UPLOAD_FAILED", "Failed to upload image for OCR");
  }

  return blob.url;
}

async function deleteBlobUrl(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;

  try {
    await del(url, { token });
  } catch (err) {
    console.warn("Blob cleanup failed", {
      name: (err as { name?: string })?.name,
      message: (err as { message?: string })?.message,
    });
  }
}

async function callMistralChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new AiError("MISSING_API_KEY", "MISTRAL_API_KEY is not configured");
  const model = options.modelOverride || process.env.MISTRAL_MODEL || DEFAULT_MODEL;
  const timeoutMs = readIntEnv("MISTRAL_TIMEOUT_MS", DEFAULT_TIMEOUT_MS, 5_000, MAX_TIMEOUT_MS);
  const maxTokens =
    options.maxTokens ?? readIntEnv("MISTRAL_MAX_TOKENS", DEFAULT_MAX_TOKENS, 1000, 6000);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(MISTRAL_CHAT_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.2,
        max_tokens: maxTokens,
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
  if (res.status === 401 || res.status === 403) {
    throw new AiError("AI_AUTH_ERROR", `AI provider rejected credentials (${res.status})`);
  }
  if (!res.ok) {
    console.error("Mistral chat error", {
      status: res.status,
      requestId: res.headers.get("x-request-id") ?? undefined,
    });
    throw new AiError("SERVER_ERROR", `AI provider returned ${res.status}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AiError("AI_INVALID_RESPONSE", "Empty AI response");
  return content;
}

async function callMistralOcr(imageUrl: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new AiError("MISSING_API_KEY", "MISTRAL_API_KEY is not configured");
  const model = process.env.MISTRAL_OCR_MODEL || DEFAULT_OCR_MODEL;
  const timeoutMs = readIntEnv("MISTRAL_TIMEOUT_MS", DEFAULT_TIMEOUT_MS, 5_000, MAX_TIMEOUT_MS);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(MISTRAL_OCR_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        document: {
          type: "image_url",
          image_url: imageUrl,
        },
        include_image_base64: false,
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
  if (res.status === 401 || res.status === 403) {
    throw new AiError("AI_AUTH_ERROR", `AI provider rejected credentials (${res.status})`);
  }
  if (!res.ok) {
    console.error("Mistral OCR error", {
      status: res.status,
      requestId: res.headers.get("x-request-id") ?? undefined,
    });
    throw new AiError("SERVER_ERROR", `AI provider returned ${res.status}`);
  }

  const json = (await res.json()) as OcrResponse;
  const markdown = json.pages
    ?.map((page) => page.markdown?.trim())
    .filter((page): page is string => Boolean(page))
    .join("\n\n");

  if (!markdown) {
    throw new AiError("AI_INVALID_RESPONSE", "OCR provider returned no readable content");
  }

  return markdown;
}

async function repairJson(broken: string, reason: string): Promise<string> {
  return callMistralChat(
    [
      {
        role: "system",
        content: `You are a strict JSON repair tool. Return ONLY one valid JSON object matching this exact schema:
{
  "html": string,
  "css": string,
  "javascript": string,
  "explanation": string,
  "accessibilityNotes": string,
  "responsiveNotes": string,
  "assumptions": string[],
  "warnings": string[]
}
No prose. No markdown fences. No comments. No extra keys. Arrays must be JSON arrays. Use empty strings or empty arrays for missing content.`,
      },
      {
        role: "user",
        content: `The previous response failed with: ${reason}

Repair this into the exact JSON schema only:

${broken.slice(0, 20_000)}`,
      },
    ],
    { temperature: 0, maxTokens: 4500 },
  );
}

async function parseOrRepairJson(raw: string): Promise<GenerateOutput> {
  const parsed = parseGenerateOutput(raw);
  if (parsed.ok) return parsed.data;

  let repaired: string;
  try {
    repaired = await repairJson(parsed.extracted, parsed.reason);
  } catch (err) {
    if (err instanceof AiError) {
      throw new AiError("JSON_REPAIR_FAILED", `Automatic JSON repair failed: ${err.message}`);
    }
    throw err;
  }

  const repairedParsed = parseGenerateOutput(repaired);
  if (repairedParsed.ok) return repairedParsed.data;

  throw new AiError(
    "JSON_REPAIR_FAILED",
    `AI returned malformed JSON after automatic repair. ${repairedParsed.reason}`,
  );
}

export async function mistralOcr(args: {
  imageBase64: string;
  mimeType: string;
}): Promise<{ ocrMarkdown: string }> {
  // Blob is uploaded only so the OCR API can fetch the image by URL, then removed
  // immediately. The synthesis step re-sends the image as a data URL, so nothing
  // is left behind if the client abandons the flow between phases.
  const imageUrl = await uploadImageToBlob(args.imageBase64, args.mimeType);
  try {
    const ocrMarkdown = await callMistralOcr(imageUrl);
    return { ocrMarkdown };
  } finally {
    await deleteBlobUrl(imageUrl);
  }
}

export async function mistralSynthesize(args: {
  systemPrompt: string;
  generationPrompt: string;
  ocrMarkdown: string;
  imageBase64: string;
  mimeType: string;
}): Promise<GenerateOutput> {
  const imageDataUrl = `data:${args.mimeType};base64,${args.imageBase64.replace(/\s+/g, "")}`;
  const raw = await callMistralChat([
    { role: "system", content: args.systemPrompt },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `${args.generationPrompt}\n\nOCR markdown (use ONLY as the source of truth for text content; infer layout, spacing, colors, typography, and visual structure from the attached image):\n${args.ocrMarkdown}`,
        },
        { type: "image_url", image_url: imageDataUrl },
      ],
    },
  ]);
  return parseOrRepairJson(raw);
}

export async function mistralRefine(args: {
  systemPrompt: string;
  refinementPrompt: string;
}): Promise<GenerateOutput> {
  const raw = await callMistralChat([
    { role: "system", content: args.systemPrompt },
    { role: "user", content: args.refinementPrompt },
  ]);
  return parseOrRepairJson(raw);
}
