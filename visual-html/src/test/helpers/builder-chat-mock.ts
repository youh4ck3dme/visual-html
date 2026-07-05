import type { Mock } from "vitest";

/** Hangs until `signal` aborts, then rejects with AbortError (matches production cancel UX). */
export function mockAbortAwareHangingChat(builderChat: Mock): void {
  builderChat.mockReset();
  builderChat.mockImplementation(({ signal }: { signal?: AbortSignal }) => {
    if (signal?.aborted) {
      return Promise.reject(new DOMException("aborted", "AbortError"));
    }
    return new Promise((_, reject) => {
      signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), {
        once: true,
      });
    });
  });
}

/** Forces server-AI-only path so `{ ok: false }` surfaces immediately without browser retry. */
export function mockServerAiOnly(builderAiStatus: Mock): void {
  builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
}

type BuilderChatResult = { ok: boolean; content: string };

/** Holds all builderChat calls until `release()` (stable off-builder toast tests). */
export function mockGatedBuilderChat(
  builderChat: Mock,
  content: string,
): { release: () => void } {
  let released = false;
  const pending: Array<(value: BuilderChatResult) => void> = [];
  const result: BuilderChatResult = { ok: true, content };

  builderChat.mockReset();
  builderChat.mockImplementation(() => {
    if (released) return Promise.resolve(result);
    return new Promise<BuilderChatResult>((resolve) => {
      pending.push(resolve);
    });
  });

  return {
    release: () => {
      released = true;
      pending.splice(0).forEach((resolve) => resolve(result));
    },
  };
}
