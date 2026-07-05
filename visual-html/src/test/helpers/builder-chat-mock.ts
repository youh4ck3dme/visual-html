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
