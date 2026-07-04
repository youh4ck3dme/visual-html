import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createBuilderGenerationTrace } from "@/lib/builder/generation-trace";
import {
  BuilderGenerationAbortedError,
  isRetryableError,
  runBuilderStep,
} from "@/lib/builder/orchestration-error";
import { clearBuilderSettings, generateBuilderCode } from "@/lib/builder/generate";
import { saveBuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

const VALID_HTML = `<!DOCTYPE html><html lang="en"><head><title>AI</title></head><body><h1>Real AI</h1></body></html>`;
const NO_RETRY_DELAY = { computeRetryDelayMs: () => 0 };

describe("builder step auto-retry", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearBuilderSettings();
  });

  it("classifies retryable and non-retryable errors", () => {
    expect(isRetryableError(new Error("network timeout"))).toBe(true);
    expect(isRetryableError(new Error("Empty server AI response"))).toBe(true);
    expect(isRetryableError(new Error("Mistral API key rejected (401 Unauthorized)"))).toBe(false);
    expect(isRetryableError(new BuilderGenerationAbortedError("building", "fast"))).toBe(false);
    expect(isRetryableError(new Error("planner boom"))).toBe(false);
  });

  it("retryable planning failure succeeds on second attempt", async () => {
    const trace = createBuilderGenerationTrace("pro");
    const updates: ReturnType<typeof createBuilderGenerationTrace>[] = [];
    let calls = 0;

    const result = await runBuilderStep(
      "planning",
      "pro",
      undefined,
      async () => {
        calls += 1;
        if (calls === 1) throw new Error("network timeout");
        return '{"mode":"build"}';
      },
      {
        trace,
        stepId: "planning",
        onTraceUpdate: (next) => updates.push(next),
      },
      NO_RETRY_DELAY,
    );

    expect(result).toBe('{"mode":"build"}');
    expect(calls).toBe(2);
    const planning = trace.steps.find((step) => step.id === "planning");
    expect(planning?.status).toBe("success");
    expect(planning?.retryCount).toBe(1);
    expect(planning?.lastErrorMessage).toBe("network timeout");
    expect(updates.some((item) => item.steps[0]?.status === "retrying")).toBe(true);
  });

  it("retryable builder failure succeeds on second attempt", async () => {
    let calls = 0;

    const result = await runBuilderStep(
      "building",
      "fast",
      undefined,
      async () => {
        calls += 1;
        if (calls === 1) throw new Error("fetch failed");
        return VALID_HTML;
      },
      undefined,
      NO_RETRY_DELAY,
    );

    expect(result).toBe(VALID_HTML);
    expect(calls).toBe(2);
  });

  it("reviewer failure retries once before surfacing step error", async () => {
    let calls = 0;

    await expect(
      runBuilderStep(
        "reviewing",
        "pro",
        undefined,
        async () => {
          calls += 1;
          throw new Error("503 Service Unavailable");
        },
        undefined,
        NO_RETRY_DELAY,
      ),
    ).rejects.toMatchObject({
      name: "BuilderOrchestrationError",
      step: "reviewing",
      message: "503 Service Unavailable",
    });

    expect(calls).toBe(2);
  });

  it("does not retry abort errors", async () => {
    const controller = new AbortController();
    let calls = 0;

    const promise = runBuilderStep("building", "fast", controller.signal, async () => {
      calls += 1;
      controller.abort();
      throw new DOMException("aborted", "AbortError");
    });

    await expect(promise).rejects.toBeInstanceOf(BuilderGenerationAbortedError);
    expect(calls).toBe(1);
  });

  it("does not retry missing API key errors", async () => {
    let calls = 0;

    await expect(
      runBuilderStep("building", "fast", undefined, async () => {
        calls += 1;
        throw new Error("Mistral API key rejected (401 Unauthorized)");
      }),
    ).rejects.toThrow(/401 Unauthorized/i);

    expect(calls).toBe(1);
  });

  it("records retryCount in trace and preserves final success duration", async () => {
    const trace = createBuilderGenerationTrace("fast");
    let calls = 0;

    await runBuilderStep(
      "building",
      "fast",
      undefined,
      async () => {
        calls += 1;
        if (calls === 1) throw new Error("network timeout");
        await new Promise((resolve) => setTimeout(resolve, 15));
        return VALID_HTML;
      },
      { trace, stepId: "building" },
      NO_RETRY_DELAY,
    );

    const building = trace.steps.find((step) => step.id === "building");
    expect(building?.status).toBe("success");
    expect(building?.retryCount).toBe(1);
    expect(building?.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("retry failure still surfaces correct step-level error", async () => {
    const trace = createBuilderGenerationTrace("pro");

    await expect(
      runBuilderStep(
        "planning",
        "pro",
        undefined,
        async () => {
          throw new Error("network timeout");
        },
        { trace, stepId: "planning" },
        NO_RETRY_DELAY,
      ),
    ).rejects.toMatchObject({
      step: "planning",
      message: "network timeout",
    });

    const planning = trace.steps.find((step) => step.id === "planning");
    expect(planning?.status).toBe("failed");
    expect(planning?.retryCount).toBe(1);
    expect(trace.steps.find((step) => step.id === "building")?.status).toBe("skipped");
  });

  it("retries through generateBuilderCode for a retryable planner failure", async () => {
    saveBuilderOrchestrationMode("pro");
    const traces: ReturnType<typeof createBuilderGenerationTrace>[] = [];
    const serverChat = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: "network timeout" })
      .mockResolvedValueOnce({ ok: true, content: '{"mode":"build"}' })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML });

    await generateBuilderCode("Build a card", vi.fn(), serverChat, undefined, "build", undefined, {
      orchestrationMode: "pro",
      preferServerAi: true,
      onTraceUpdate: (trace) => traces.push(trace),
    });

    expect(serverChat).toHaveBeenCalledTimes(4);
    const planning = traces.at(-1)?.steps.find((step) => step.id === "planning");
    expect(planning?.status).toBe("success");
    expect(planning?.retryCount).toBe(1);
  });

  it("continues beast pipeline when one builder candidate fails", async () => {
    saveBuilderOrchestrationMode("beast");
    const serverChat = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, content: '{"mode":"build"}' })
      .mockResolvedValueOnce({ ok: false, message: "network timeout" })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML });
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
    expect(serverChat).toHaveBeenCalledTimes(4);
    const finalTrace = traces.at(-1)!;
    expect(finalTrace.steps.find((step) => step.id === "buildingA")?.status).toBe("failed");
    expect(finalTrace.steps.find((step) => step.id === "buildingB")?.status).toBe("success");
    expect(finalTrace.steps.find((step) => step.id === "judging")?.status).toBe("skipped");
    expect(finalTrace.steps.find((step) => step.id === "reviewing")?.status).toBe("success");
  });
});
