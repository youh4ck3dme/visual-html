import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

import {
  getMistralKeyPool,
  maskApiKey,
  orderKeysBySlot,
  shouldFailoverToNextKey,
  type MistralKeyRole,
  type MistralKeySlot,
} from "@/lib/ai/mistral-keys";
import {
  parseGenerateOutput,
  prepareJsonRepairInput,
  recoverPartialGenerateOutput,
} from "@/lib/ai/json-output";
import { annotateGenerateOutputQuality, type GenerateOutput } from "@/lib/validation/generation";

const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";
const DEFAULT_MODEL = "pixtral-large-latest";
const DEFAULT_OCR_MODEL = "mistral-ocr-latest";
const DEFAULT_MAX_TOKENS = 3000;
const REPAIR_MAX_TOKENS = 3500;
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
      | "AI_QUOTA_EXHAUSTED"
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
  keySlot?: MistralKeySlot;
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

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new AiError("AI_TIMEOUT", "AI request timed out");
    }
    throw new AiError("SERVER_ERROR", "Failed to reach AI provider");
  } finally {
    clearTimeout(timer);
  }
}

async function callMistralWithKeyPool(
  role: MistralKeyRole,
  operation: (apiKey: string) => Promise<Response>,
  keysOverride?: string[],
): Promise<Response> {
  const keys = keysOverride?.length ? keysOverride : getMistralKeyPool(role);
  if (keys.length === 0) {
    throw new AiError(
      "MISSING_API_KEY",
      "No Mistral API keys configured (set MISTRAL_API_KEY or role-specific keys)",
    );
  }

  let lastStatus = 0;
  let lastBody = "";

  for (let index = 0; index < keys.length; index += 1) {
    const apiKey = keys[index];
    const hasMoreKeys = index < keys.length - 1;
    const res = await operation(apiKey);

    if (res.ok) {
      if (index > 0) {
        console.info(`Mistral ${role} succeeded with fallback key ${maskApiKey(apiKey)}`);
      }
      return res;
    }

    lastStatus = res.status;
    lastBody = await res.text();

    if (shouldFailoverToNextKey(res.status, lastBody, hasMoreKeys)) {
      console.warn(
        `Mistral ${role} key ${maskApiKey(apiKey)} returned ${res.status}; trying next key`,
      );
      continue;
    }

    return new Response(lastBody, {
      status: lastStatus,
      headers: res.headers,
    });
  }

  if (lastStatus === 429 || QUOTA_STATUS_HINT.test(lastBody)) {
    throw new AiError(
      "AI_QUOTA_EXHAUSTED",
      "All configured Mistral API keys are rate-limited or out of quota",
    );
  }
  if (lastStatus === 401 || lastStatus === 403) {
    throw new AiError("AI_AUTH_ERROR", `AI provider rejected credentials (${lastStatus})`);
  }
  throw new AiError("SERVER_ERROR", `AI provider returned ${lastStatus || 500}`);
}

const QUOTA_STATUS_HINT =
  /quota|rate.?limit|billing|exceeded|insufficient|credit|capacity|too many requests/i;

function throwMistralHttpError(role: MistralKeyRole, res: Response, bodyText: string): never {
  if (res.status === 429 || (res.status === 402 && QUOTA_STATUS_HINT.test(bodyText))) {
    throw new AiError("AI_QUOTA_EXHAUSTED", "Mistral rate limit or quota exceeded");
  }
  if (res.status === 401 || res.status === 403) {
    throw new AiError("AI_AUTH_ERROR", `AI provider rejected credentials (${res.status})`);
  }

  console.error(`Mistral ${role} error`, {
    status: res.status,
    requestId: res.headers.get("x-request-id") ?? undefined,
  });
  throw new AiError("SERVER_ERROR", `AI provider returned ${res.status}`);
}

async function callMistralChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
  jsonMode = true,
): Promise<string> {
  const model = options.modelOverride || process.env.MISTRAL_MODEL || DEFAULT_MODEL;
  const timeoutMs = readIntEnv("MISTRAL_TIMEOUT_MS", DEFAULT_TIMEOUT_MS, 5_000, MAX_TIMEOUT_MS);
  const maxTokens =
    options.maxTokens ?? readIntEnv("MISTRAL_MAX_TOKENS", DEFAULT_MAX_TOKENS, 1000, 6000);

  const chatKeys = orderKeysBySlot(getMistralKeyPool("chat"), options.keySlot ?? "auto");
  const res = await callMistralWithKeyPool(
    "chat",
    (apiKey) =>
      fetchWithTimeout(
        MISTRAL_CHAT_URL,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: options.temperature ?? 0.2,
            max_tokens: maxTokens,
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
            messages,
          }),
        },
        timeoutMs,
      ),
    chatKeys,
  );

  const bodyText = await res.text();
  if (!res.ok) throwMistralHttpError("chat", res, bodyText);

  const json = JSON.parse(bodyText) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AiError("AI_INVALID_RESPONSE", "Empty AI response");
  return content;
}

/** Plain-text Mistral chat for VibeCraft builder (single-file HTML output). */
export async function mistralBuilderChat(args: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  keySlot?: MistralKeySlot;
  jsonMode?: boolean;
}): Promise<string> {
  const model =
    args.model ||
    process.env.MISTRAL_BUILDER_MODEL ||
    process.env.MISTRAL_MODEL ||
    "mistral-large-latest";

  return callMistralChat(
    [
      { role: "system", content: args.systemPrompt },
      { role: "user", content: args.userPrompt },
    ],
    {
      modelOverride: model,
      maxTokens: 8000,
      temperature: 0.2,
      keySlot: args.keySlot,
    },
    args.jsonMode ?? false,
  );
}

async function callMistralOcr(imageUrl: string): Promise<string> {
  const model = process.env.MISTRAL_OCR_MODEL || DEFAULT_OCR_MODEL;
  const timeoutMs = readIntEnv("MISTRAL_TIMEOUT_MS", DEFAULT_TIMEOUT_MS, 5_000, MAX_TIMEOUT_MS);

  const res = await callMistralWithKeyPool("ocr", (apiKey) =>
    fetchWithTimeout(
      MISTRAL_OCR_URL,
      {
        method: "POST",
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
      },
      timeoutMs,
    ),
  );

  const bodyText = await res.text();
  if (!res.ok) throwMistralHttpError("ocr", res, bodyText);

  const json = JSON.parse(bodyText) as OcrResponse;
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
  const repairInput = prepareJsonRepairInput(broken);

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
No prose. No markdown fences. No comments. No extra keys. Arrays must be JSON arrays. Use empty strings or empty arrays for missing content.
If the input is truncated, synthesize minimal valid content for missing or cut fields instead of continuing an unterminated string.
Keep explanation, accessibilityNotes, responsiveNotes, assumptions, and warnings brief.`,
      },
      {
        role: "user",
        content: `The previous response failed with: ${reason}

Repair this into the exact JSON schema only:

${repairInput}`,
      },
    ],
    { temperature: 0, maxTokens: REPAIR_MAX_TOKENS },
  );
}

async function parseOrRepairJson(raw: string): Promise<GenerateOutput> {
  const parsed = parseGenerateOutput(raw);
  if (parsed.ok) return annotateGenerateOutputQuality(parsed.data);

  const recovered = recoverPartialGenerateOutput(parsed.extracted);
  if (recovered) return annotateGenerateOutputQuality(recovered);

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
  if (repairedParsed.ok) return annotateGenerateOutputQuality(repairedParsed.data);

  const recoveredRepair = recoverPartialGenerateOutput(repairedParsed.extracted);
  if (recoveredRepair) return annotateGenerateOutputQuality(recoveredRepair);

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
