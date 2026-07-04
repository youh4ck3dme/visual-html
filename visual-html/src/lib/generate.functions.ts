import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import {
  ALLOWED_MIME,
  continueInputSchema,
  generateInputSchema,
  imageUrlInputSchema,
  MAX_UPLOAD_BYTES,
  ocrInputSchema,
  refineInputSchema,
  type GenerateOutput,
} from "@/lib/validation/generation";
import { createApiError } from "@/lib/generation-diagnostics";
import type { ApiError, ApiErrorCode, GenerationPhase } from "@/types/generation";

export type ServerResult = { ok: true; data: GenerateOutput } | { ok: false; error: ApiError };

export type OcrResult = { ok: true; ocrMarkdown: string } | { ok: false; error: ApiError };

export type FetchImageResult =
  | {
      ok: true;
      base64: string;
      mimeType: (typeof ALLOWED_MIME)[number];
      fileName: string;
    }
  | { ok: false; error: ApiError };

const RATE_LIMITED_MESSAGE = "Too many requests. Please slow down and try again shortly.";

// Trust X-Forwarded-For because the app runs behind Vercel's proxy.
function getClientIp(): string {
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

function phaseForAiError(code: ApiErrorCode, fallback: GenerationPhase): GenerationPhase {
  switch (code) {
    case "MISSING_BLOB_TOKEN":
    case "BLOB_UPLOAD_FAILED":
      return "uploading_to_blob";
    case "RATE_LIMITED":
      return "rate_limited_check";
    case "JSON_REPAIR_FAILED":
      return "json_repair";
    default:
      return fallback;
  }
}

// Phase 1 of generation: upload + OCR. Kept separate from synthesis so the client
// can reflect the real, in-flight pipeline phase (not a fake timer).
export const runOcr = createServerFn({ method: "POST" })
  .validator((input: unknown) => ocrInputSchema.parse(input))
  .handler(async ({ data }): Promise<OcrResult> => {
    const { AiError, mistralOcr } = await import("@/lib/ai/mistral.server");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "ocr");
    if (!limit.success) {
      return {
        ok: false,
        error: createApiError("RATE_LIMITED", RATE_LIMITED_MESSAGE, "rate_limited_check"),
      };
    }

    try {
      const { ocrMarkdown } = await mistralOcr({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType,
      });
      return { ok: true, ocrMarkdown };
    } catch (err) {
      if (err instanceof AiError) {
        return {
          ok: false,
          error: createApiError(err.code, err.message, phaseForAiError(err.code, "ocr")),
        };
      }
      console.error("runOcr unexpected", err);
      return {
        ok: false,
        error: createApiError("SERVER_ERROR", "Unexpected server error", "uploading_to_blob"),
      };
    }
  });

// Phase 2 of generation: synthesize HTML/CSS from the image + OCR markdown.
export const generateHtml = createServerFn({ method: "POST" })
  .validator((input: unknown) => generateInputSchema.parse(input))
  .handler(async ({ data }): Promise<ServerResult> => {
    const { AiError, mistralSynthesize } = await import("@/lib/ai/mistral.server");
    const { SYSTEM_PROMPT, buildOcrGenerationPrompt, buildUserInstructions } =
      await import("@/lib/ai/prompts");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "generate");
    if (!limit.success) {
      return {
        ok: false,
        error: createApiError("RATE_LIMITED", RATE_LIMITED_MESSAGE, "rate_limited_check"),
      };
    }

    try {
      const result = await mistralSynthesize({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType,
        ocrMarkdown: data.ocrMarkdown,
        systemPrompt: SYSTEM_PROMPT,
        generationPrompt: buildOcrGenerationPrompt(buildUserInstructions(data.options)),
      });
      return { ok: true, data: result };
    } catch (err) {
      if (err instanceof AiError) {
        return {
          ok: false,
          error: createApiError(err.code, err.message, phaseForAiError(err.code, "synthesizing")),
        };
      }
      console.error("generateHtml unexpected", err);
      return {
        ok: false,
        error: createApiError("SERVER_ERROR", "Unexpected server error", "synthesizing"),
      };
    }
  });

export const refineHtml = createServerFn({ method: "POST" })
  .validator((input: unknown) => refineInputSchema.parse(input))
  .handler(async ({ data }): Promise<ServerResult> => {
    const { AiError, mistralRefine } = await import("@/lib/ai/mistral.server");
    const { SYSTEM_PROMPT, buildRefinementPrompt } = await import("@/lib/ai/prompts");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "refine");
    if (!limit.success) {
      return {
        ok: false,
        error: createApiError("RATE_LIMITED", RATE_LIMITED_MESSAGE, "rate_limited_check"),
      };
    }

    try {
      const result = await mistralRefine({
        systemPrompt: SYSTEM_PROMPT,
        refinementPrompt: buildRefinementPrompt({
          html: data.prior.html,
          css: data.prior.css,
          javascript: data.prior.javascript,
          instruction: data.instruction,
          options: data.options,
        }),
      });
      return { ok: true, data: result };
    } catch (err) {
      if (err instanceof AiError) {
        return {
          ok: false,
          error: createApiError(err.code, err.message, phaseForAiError(err.code, "synthesizing")),
        };
      }
      console.error("refineHtml unexpected", err);
      return {
        ok: false,
        error: createApiError("SERVER_ERROR", "Unexpected server error", "synthesizing"),
      };
    }
  });

export const continueHtml = createServerFn({ method: "POST" })
  .validator((input: unknown) => continueInputSchema.parse(input))
  .handler(async ({ data }): Promise<ServerResult> => {
    const { AiError, mistralRefine } = await import("@/lib/ai/mistral.server");
    const { SYSTEM_PROMPT, buildContinuationPrompt } = await import("@/lib/ai/prompts");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "continue");
    if (!limit.success) {
      return {
        ok: false,
        error: createApiError("RATE_LIMITED", RATE_LIMITED_MESSAGE, "rate_limited_check"),
      };
    }

    try {
      const result = await mistralRefine({
        systemPrompt: SYSTEM_PROMPT,
        refinementPrompt: buildContinuationPrompt({
          html: data.prior.html,
          css: data.prior.css,
          javascript: data.prior.javascript,
          options: data.options,
        }),
      });
      return { ok: true, data: result };
    } catch (err) {
      if (err instanceof AiError) {
        return {
          ok: false,
          error: createApiError(err.code, err.message, phaseForAiError(err.code, "synthesizing")),
        };
      }
      console.error("continueHtml unexpected", err);
      return {
        ok: false,
        error: createApiError("SERVER_ERROR", "Unexpected server error", "synthesizing"),
      };
    }
  });

export const fetchImageFromUrl = createServerFn({ method: "POST" })
  .validator((input: unknown) => imageUrlInputSchema.parse(input))
  .handler(async ({ data }): Promise<FetchImageResult> => {
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "ocr");
    if (!limit.success) {
      return {
        ok: false,
        error: createApiError("RATE_LIMITED", RATE_LIMITED_MESSAGE, "rate_limited_check"),
      };
    }

    try {
      const parsed = new URL(data.url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return {
          ok: false,
          error: createApiError("INVALID_FILE", "Only HTTP(S) image URLs are supported", "validating"),
        };
      }

      const response = await fetch(parsed.toString(), {
        headers: { Accept: "image/png,image/jpeg,image/webp,*/*" },
        signal: AbortSignal.timeout(15_000),
        redirect: "follow",
      });

      if (!response.ok) {
        return {
          ok: false,
          error: createApiError(
            "INVALID_FILE",
            `Could not fetch image (HTTP ${response.status})`,
            "validating",
          ),
        };
      }

      const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
      if (!mimeType || !(ALLOWED_MIME as readonly string[]).includes(mimeType)) {
        return {
          ok: false,
          error: createApiError(
            "INVALID_FILE",
            "URL must point to a PNG, JPG, or WebP image",
            "validating",
          ),
        };
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0) {
        return {
          ok: false,
          error: createApiError("INVALID_FILE", "Image file is empty", "validating"),
        };
      }
      if (buffer.byteLength > MAX_UPLOAD_BYTES) {
        return {
          ok: false,
          error: createApiError("INVALID_FILE", "Image exceeds size limit", "validating"),
        };
      }

      const ext =
        mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
      const pathName = parsed.pathname.split("/").pop() || `remote-image.${ext}`;
      const fileName = pathName.includes(".") ? pathName : `${pathName}.${ext}`;

      return {
        ok: true,
        base64: Buffer.from(buffer).toString("base64"),
        mimeType: mimeType as (typeof ALLOWED_MIME)[number],
        fileName,
      };
    } catch (err) {
      const message =
        err instanceof Error && err.name === "TimeoutError"
          ? "Image download timed out"
          : err instanceof Error
            ? err.message
            : "Could not fetch image";
      return {
        ok: false,
        error: createApiError("INVALID_FILE", message, "validating"),
      };
    }
  });
