import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBuilderGenerationTrace } from "@/lib/builder/generation-trace";
import {
  BuilderGenerationAbortedError,
  BuilderStepTimeoutError,
  isFallbackSafeError,
  isRetryableError,
  isTimeoutError,
  runBuilderStep,
  runStepWithTimeout,
} from "@/lib/builder/orchestration-error";
import { FAST_BUILDING_TIMEOUT_MS, getStepTimeoutMs } from "@/lib/builder/step-timeout";
import { clearBuilderSettings, generateBuilderCode, isAbortError } from "@/lib/builder/generate";
import { saveBuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

const VALID_HTML = `<!DOCTYPE html><html lang="en"><head><title>AI</title></head><body><h1>Real AI</h1></body></html>`;
const NO_RETRY_DELAY = { computeRetryDelayMs: () => 0 };

describe("builder step timeout and fallback", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearBuilderSettings();
    vi.useRealTimers();
  });

  it("exposes per-step timeout configuration", () => {
    expect(getStepTimeoutMs("building", "fast")).toBe(FAST_BUILDING_TIMEOUT_MS);
    expect(getStepTimeoutMs("planning", "pro")).toBe(60_000);
    expect(getStepTimeoutMs("building", "pro")).toBe(75_000);
    expect(getStepTimeoutMs("reviewing", "beast")).toBe(75_000);
    expect(getStepTimeoutMs("finalizing", "fast")).toBe(5_000);
  });

  it("classifies timeout errors as retryable and not cancellable", () => {
    const timeout = new BuilderStepTimeoutError(60_000, "building");
    expect(isTimeoutError(timeout)).toBe(true);
    expect(isRetryableError(timeout)).toBe(true);
    expect(isFallbackSafeError(timeout)).toBe(true);
  });

  it("building times out and retries once", async () => {
    const trace = createBuilderGenerationTrace("fast");
    let calls = 0;

    await expect(
      runBuilderStep(
        "building",
        "fast",
        undefined,
        async () => {
          calls += 1;
          throw new BuilderStepTimeoutError(60_000, "building");
        },
        { trace, stepId: "building", timeoutMs: 60_000 },
        NO_RETRY_DELAY,
      ),
    ).rejects.toMatchObject({ step: "building" });

    expect(calls).toBe(2);
    const building = trace.steps.find((step) => step.id === "building");
    expect(building?.retryCount).toBe(1);
    expect(building?.timedOut).toBe(true);
    expect(building?.timeoutMs).toBe(60_000);
  });

  it("timeout after retry surfaces step-level timeout error", async () => {
    await expect(
      runBuilderStep(
        "building",
        "fast",
        undefined,
        async () => {
          throw new BuilderStepTimeoutError(60_000, "building");
        },
        undefined,
        NO_RETRY_DELAY,
      ),
    ).rejects.toMatchObject({
      name: "BuilderOrchestrationError",
      step: "building",
      message: /time limit/i,
    });
  });

  it("parent abort cancels immediately and is not retried", async () => {
    const controller = new AbortController();
    controller.abort();
    let calls = 0;

    await expect(
      runBuilderStep("building", "fast", controller.signal, async () => {
        calls += 1;
        return "ok";
      }),
    ).rejects.toBeInstanceOf(BuilderGenerationAbortedError);

    expect(calls).toBe(0);
  });

  it("runStepWithTimeout throws BuilderStepTimeoutError when attempt exceeds limit", async () => {
    vi.useFakeTimers();
    try {
      const promise = runStepWithTimeout(
        undefined,
        50,
        "building",
        "fast",
        (attemptSignal) =>
          new Promise<string>((_resolve, reject) => {
            attemptSignal?.addEventListener("abort", () => {
              reject(new DOMException("aborted", "AbortError"));
            });
          }),
      );

      const expectation = expect(promise).rejects.toBeInstanceOf(BuilderStepTimeoutError);
      await vi.advanceTimersByTimeAsync(60);
      await expectation;
    } finally {
      vi.useRealTimers();
    }
  });

  it("parent abort wins over step timeout", async () => {
    const controller = new AbortController();
    const promise = runStepWithTimeout(
      controller.signal,
      5_000,
      "building",
      "fast",
      (attemptSignal) =>
        new Promise<string>((_resolve, reject) => {
          if (attemptSignal?.aborted) {
            reject(new DOMException("aborted", "AbortError"));
            return;
          }
          attemptSignal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );

    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(BuilderGenerationAbortedError);
  });

  it("fallback runs only after retry exhaustion for retryable failures", async () => {
    saveBuilderOrchestrationMode("fast");
    const traces: ReturnType<typeof createBuilderGenerationTrace>[] = [];
    const serverChat = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: "network timeout" })
      .mockResolvedValueOnce({ ok: false, message: "network timeout" });

    const result = await generateBuilderCode(
      "snake game",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      {
        orchestrationMode: "fast",
        preferServerAi: true,
        onTraceUpdate: (trace) => traces.push(trace),
      },
    );

    expect(serverChat).toHaveBeenCalledTimes(2);
    expect(result.via).toBe("offline");
    const building = traces.at(-1)?.steps.find((step) => step.id === "building");
    expect(building?.usedFallback).toBe(true);
    expect(building?.timedOut).toBe(false);
  });

  it("fallback does not run on cancel", async () => {
    saveBuilderOrchestrationMode("fast");
    const controller = new AbortController();
    const serverChat = vi.fn(
      () =>
        new Promise<{ ok: true; content: string }>((_resolve, reject) => {
          controller.signal.addEventListener(
            "abort",
            () => {
              reject(new DOMException("aborted", "AbortError"));
            },
            { once: true },
          );
        }),
    );

    const promise = generateBuilderCode(
      "Build a card",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      {
        orchestrationMode: "fast",
        preferServerAi: true,
        signal: controller.signal,
      },
    );

    await vi.waitFor(() => expect(serverChat).toHaveBeenCalled());
    controller.abort();
    await expect(promise).rejects.toSatisfy((error: unknown) => isAbortError(error));
  });

  it("fallback does not run on missing API key", async () => {
    await expect(
      generateBuilderCode(
        "Build a card",
        vi.fn(),
        async () => ({ ok: false, message: "Mistral API key rejected (401 Unauthorized)" }),
        undefined,
        "build",
        undefined,
        { orchestrationMode: "fast", preferServerAi: true },
      ),
    ).rejects.toThrow(/401 Unauthorized/i);
  });

  it("continues beast pipeline when one builder times out and the other succeeds", async () => {
    saveBuilderOrchestrationMode("beast");
    const serverChat = vi.fn(async (args: { keySlot?: string; jsonMode?: boolean }) => {
      if (args.jsonMode) {
        return { ok: true as const, content: '{"mode":"build"}' };
      }
      if (args.keySlot === "secondary") {
        return { ok: false as const, message: "network timeout" };
      }
      return { ok: true as const, content: VALID_HTML };
    });
    const traces: ReturnType<typeof createBuilderGenerationTrace>[] = [];

    const result = await generateBuilderCode(
      "Build a beast card",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      {
        orchestrationMode: "beast",
        preferServerAi: true,
        onTraceUpdate: (trace) => traces.push(trace),
      },
    );

    expect(result.type).toBe("code");
    const finalTrace = traces.at(-1)!;
    expect(finalTrace.steps.find((step) => step.id === "buildingA")?.status).toBe("success");
    expect(finalTrace.steps.find((step) => step.id === "buildingB")?.status).toBe("failed");
    expect(finalTrace.steps.find((step) => step.id === "judging")?.status).toBe("skipped");
    expect(finalTrace.steps.find((step) => step.id === "reviewing")?.status).toBe("success");
  });
});
