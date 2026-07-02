import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

import {
  generateInputSchema,
  refineInputSchema,
  type GenerateOutput,
} from "@/lib/validation/generation";
import type { ApiErrorCode } from "@/types/generation";

export type ServerResult =
  | { ok: true; data: GenerateOutput }
  | { ok: false; error: { code: ApiErrorCode; message: string } };

const RATE_LIMITED_RESULT: ServerResult = {
  ok: false,
  error: {
    code: "RATE_LIMITED",
    message: "Too many requests. Please slow down and try again shortly.",
  },
};

// Trust X-Forwarded-For because the app runs behind Vercel's proxy.
function getClientIp(): string {
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

export const generateHtml = createServerFn({ method: "POST" })
  .validator((input: unknown) => generateInputSchema.parse(input))
  .handler(async ({ data }): Promise<ServerResult> => {
    const { AiError, mistralGenerate } = await import("@/lib/ai/mistral.server");
    const { SYSTEM_PROMPT, buildOcrGenerationPrompt, buildUserInstructions } =
      await import("@/lib/ai/prompts");
    const { checkRateLimit } = await import("@/lib/rate-limit.server");

    const limit = await checkRateLimit(getClientIp(), "generate");
    if (!limit.success) return RATE_LIMITED_RESULT;

    try {
      const result = await mistralGenerate({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType,
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
    if (!limit.success) return RATE_LIMITED_RESULT;

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
