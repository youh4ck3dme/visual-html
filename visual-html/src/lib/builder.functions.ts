import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import { createApiError } from "@/lib/generation-diagnostics";

const builderChatSchema = z.object({
  systemPrompt: z.string().max(120_000),
  userPrompt: z.string().max(120_000),
  model: z.string().max(80).optional(),
});

export type BuilderChatResult = { ok: true; content: string } | { ok: false; message: string };

function getClientIp(): string {
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

export const builderChat = createServerFn({ method: "POST" })
  .validator((input: unknown) => builderChatSchema.parse(input))
  .handler(async ({ data }): Promise<BuilderChatResult> => {
    const { checkRateLimit } = await import("@/lib/rate-limit.server");
    const limit = await checkRateLimit(getClientIp(), "builder");
    if (!limit.success) {
      return { ok: false, message: "Rate limit reached. Please try again shortly." };
    }

    const { AiError, mistralBuilderChat } = await import("@/lib/ai/mistral.server");

    try {
      const content = await mistralBuilderChat(data);
      return { ok: true, content };
    } catch (error) {
      if (error instanceof AiError) {
        const api = createApiError(error.code, error.message, "synthesizing");
        return { ok: false, message: api.diagnostic?.detail ?? error.message };
      }
      return { ok: false, message: (error as Error).message ?? "Builder AI failed" };
    }
  });
