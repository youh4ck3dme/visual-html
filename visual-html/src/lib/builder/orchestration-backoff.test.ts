import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBuilderGenerationTrace } from "@/lib/builder/generation-trace";
import { BuilderGenerationAbortedError, runBuilderStep } from "@/lib/builder/orchestration-error";

const VALID_HTML = `<!DOCTYPE html><html lang="en"><head><title>AI</title></head><body><h1>Real AI</h1></body></html>`;

describe("builder retry backoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits before retrying a failed retryable step", async () => {
    const trace = createBuilderGenerationTrace("fast");
    const statuses: string[] = [];
    let calls = 0;
    const delayMs = 500;

    const promise = runBuilderStep(
      "building",
      "fast",
      undefined,
      async () => {
        calls += 1;
        if (calls === 1) throw new Error("network timeout");
        return VALID_HTML;
      },
      {
        trace,
        stepId: "building",
        onTraceUpdate: (nextTrace) => {
          const building = nextTrace.steps.find((step) => step.id === "building");
          if (building?.status) statuses.push(building.status);
        },
      },
      { computeRetryDelayMs: () => delayMs },
    );

    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toBe(1);

    const building = trace.steps.find((step) => step.id === "building");
    expect(building?.status).toBe("waitingToRetry");
    expect(building?.retryDelayMs).toBe(delayMs);
    expect(statuses).toContain("waitingToRetry");

    await vi.advanceTimersByTimeAsync(delayMs - 1);
    expect(calls).toBe(1);

    await vi.advanceTimersByTimeAsync(1);
    await promise;

    expect(calls).toBe(2);
    expect(building?.status).toBe("success");
    expect(building?.retryStartedAt).toBeTypeOf("number");
  });

  it("abort during retry delay rejects without a second attempt", async () => {
    const controller = new AbortController();
    const trace = createBuilderGenerationTrace("fast");
    let calls = 0;
    const delayMs = 800;

    const promise = runBuilderStep(
      "building",
      "fast",
      controller.signal,
      async () => {
        calls += 1;
        throw new Error("network timeout");
      },
      { trace, stepId: "building" },
      { computeRetryDelayMs: () => delayMs },
    );
    const rejection = expect(promise).rejects.toBeInstanceOf(BuilderGenerationAbortedError);

    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toBe(1);
    expect(trace.steps.find((step) => step.id === "building")?.status).toBe("waitingToRetry");

    controller.abort();
    await vi.advanceTimersByTimeAsync(delayMs);
    await rejection;

    expect(calls).toBe(1);
    expect(trace.steps.find((step) => step.id === "building")?.status).toBe("cancelled");
  });

  it("does not delay when no retry will happen", async () => {
    let calls = 0;

    await expect(
      runBuilderStep(
        "building",
        "fast",
        undefined,
        async () => {
          calls += 1;
          throw new Error("Mistral API key rejected (401 Unauthorized)");
        },
        undefined,
        { computeRetryDelayMs: () => 500 },
      ),
    ).rejects.toThrow(/401 Unauthorized/i);

    expect(calls).toBe(1);
  });
});
