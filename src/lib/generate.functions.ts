import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import {
  generateInputSchema,
  ocrInputSchema,
  refineInputSchema,
  type GenerateOutput,
} from "@/lib/validation/generation";
import type { ApiErrorCode } from "@/types/generation";

export type ServerResult =
  | { ok: true; data: GenerateOutput }
  | { ok: false; error: { code: ApiErrorCode; message: string } };

export type OcrResult =
  { ok: true; ocrMarkdown: string } | { ok: false; error: { code: ApiErrorCode; message: string } };

const RATE_LIMITED_ERROR = {
  code: "RATE_LIMITED" as const,
  message: "Too many requests. Please slow down and try again shortly.",
};

// Trust X-Forwarded-For because the app runs behind Vercel's proxy.
function getClientIp(): string {
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

// Phase 1 of generation: upload + OCR. Kept separate from synthesis so the client
// can reflect the real, in-flight pipeline phase (not a fake timer).
export const runOcr = createServerFn({ method: "POST" })
  .validator((input: unknown) => ocrInputSchema.parse(input))
  .handler(async ({ data }): Promise<OcrResult> => {
    const { AiError, mistralOcr } = await import("@/lib/ai/mistral.server");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "ocr");
    if (!limit.success) return { ok: false, error: RATE_LIMITED_ERROR };

    try {
      const { ocrMarkdown } = await mistralOcr({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType,
      });
      return { ok: true, ocrMarkdown };
    } catch (err) {
      if (err instanceof AiError)
        return { ok: false, error: { code: err.code, message: err.message } };
      console.error("runOcr unexpected", err);
      return { ok: false, error: { code: "SERVER_ERROR", message: "Unexpected server error" } };
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
    if (!limit.success) return { ok: false, error: RATE_LIMITED_ERROR };

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
      if (err instanceof AiError)
        return { ok: false, error: { code: err.code, message: err.message } };
      console.error("generateHtml unexpected", err);
      return { ok: false, error: { code: "SERVER_ERROR", message: "Unexpected server error" } };
    }
  });

export const refineHtml = createServerFn({ method: "POST" })
  .validator((input: unknown) => refineInputSchema.parse(input))
  .handler(async ({ data }): Promise<ServerResult> => {
    const { AiError, mistralRefine } = await import("@/lib/ai/mistral.server");
    const { SYSTEM_PROMPT, buildRefinementPrompt } = await import("@/lib/ai/prompts");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "refine");
    if (!limit.success) return { ok: false, error: RATE_LIMITED_ERROR };

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
      if (err instanceof AiError)
        return { ok: false, error: { code: err.code, message: err.message } };
      console.error("refineHtml unexpected", err);
      return { ok: false, error: { code: "SERVER_ERROR", message: "Unexpected server error" } };
    }
  });
