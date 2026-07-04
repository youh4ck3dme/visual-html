import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createBuilderGenerationTrace,
  getTraceStepIdsForMode,
  traceHasFailedStep,
} from "@/lib/builder/generation-trace";
import { runBuilderStep } from "@/lib/builder/orchestration-error";
import {
  clearBuilderSettings,
  generateBuilderCode,
  saveBuilderSettings,
} from "@/lib/builder/generate";
import { saveBuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

const VALID_HTML = `<!DOCTYPE html><html lang="en"><head><title>AI</title></head><body><h1>Real AI</h1></body></html>`;

describe("builder generation trace", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearBuilderSettings();
  });

  it("fast mode trace has one building step plus finalizing", () => {
    const trace = createBuilderGenerationTrace("fast");
    expect(getTraceStepIdsForMode("fast")).toEqual(["building", "finalizing"]);
    expect(trace.steps.map((step) => step.id)).toEqual(["building", "finalizing"]);
    expect(trace.steps.every((step) => step.status === "pending")).toBe(true);
  });

  it("pro mode trace has planning, building, reviewing, and finalizing", () => {
    const trace = createBuilderGenerationTrace("pro");
    expect(getTraceStepIdsForMode("pro")).toEqual([
      "planning",
      "building",
      "reviewing",
      "finalizing",
    ]);
    expect(trace.steps.map((step) => step.id)).toEqual([
      "planning",
      "building",
      "reviewing",
      "finalizing",
    ]);
  });

  it("beast mode trace has planning, buildingA, buildingB, judging, reviewing, and finalizing", () => {
    const trace = createBuilderGenerationTrace("beast");
    expect(getTraceStepIdsForMode("beast")).toEqual([
      "planning",
      "buildingA",
      "buildingB",
      "judging",
      "reviewing",
      "finalizing",
    ]);
    expect(trace.steps.map((step) => step.id)).toEqual([
      "planning",
      "buildingA",
      "buildingB",
      "judging",
      "reviewing",
      "finalizing",
    ]);
  });

  it("successful step records duration", async () => {
    const trace = createBuilderGenerationTrace("fast");
    const updates: (typeof trace)[] = [];

    await runBuilderStep(
      "building",
      "fast",
      undefined,
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return "ok";
      },
      {
        trace,
        stepId: "building",
        onTraceUpdate: (next) => updates.push(next),
      },
    );

    const buildingStep = trace.steps.find((step) => step.id === "building");
    expect(buildingStep?.status).toBe("success");
    expect(buildingStep?.startedAt).toBeTypeOf("number");
    expect(buildingStep?.finishedAt).toBeTypeOf("number");
    expect(buildingStep?.durationMs).toBeGreaterThanOrEqual(0);
    expect(updates.some((item) => item.steps[0]?.status === "running")).toBe(true);
    expect(updates.at(-1)?.steps[0]?.status).toBe("success");
  });

  it("failed step records error and status failed", async () => {
    const trace = createBuilderGenerationTrace("pro");

    await expect(
      runBuilderStep(
        "planning",
        "pro",
        undefined,
        async () => {
          throw new Error("planner boom");
        },
        { trace, stepId: "planning" },
      ),
    ).rejects.toThrow("planner boom");

    const planningStep = trace.steps.find((step) => step.id === "planning");
    expect(planningStep?.status).toBe("failed");
    expect(planningStep?.errorMessage).toBe("planner boom");
    expect(planningStep?.durationMs).toBeGreaterThanOrEqual(0);
    expect(trace.steps.find((step) => step.id === "building")?.status).toBe("skipped");
    expect(traceHasFailedStep(trace)).toBe(true);
  });

  it("cancelled step records status cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    const trace = createBuilderGenerationTrace("fast");

    await expect(
      runBuilderStep("building", "fast", controller.signal, async () => "ok", {
        trace,
        stepId: "building",
      }),
    ).rejects.toMatchObject({ name: "BuilderGenerationAbortedError" });

    const buildingStep = trace.steps.find((step) => step.id === "building");
    expect(buildingStep?.status).toBe("cancelled");
    expect(trace.steps.find((step) => step.id === "finalizing")?.status).toBe("skipped");
  });

  it("emits trace updates through generateBuilderCode in pro mode", async () => {
    saveBuilderOrchestrationMode("pro");
    const serverChat = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, content: '{"mode":"build"}' })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML });
    const traces: ReturnType<typeof createBuilderGenerationTrace>[] = [];

    await generateBuilderCode("Build a card", vi.fn(), serverChat, undefined, "build", undefined, {
      orchestrationMode: "pro",
      onTraceUpdate: (trace) => traces.push(trace),
    });

    expect(traces.length).toBeGreaterThan(0);
    const finalTrace = traces.at(-1)!;
    expect(finalTrace.steps.map((step) => step.id)).toEqual([
      "planning",
      "building",
      "reviewing",
      "finalizing",
    ]);
    expect(finalTrace.steps.every((step) => step.status === "success")).toBe(true);
    expect(finalTrace.totalDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("records failed planning step in pro mode trace", async () => {
    saveBuilderSettings({ key1: "test-key", key2: "", model: "mistral-large-latest" });
    const traces: ReturnType<typeof createBuilderGenerationTrace>[] = [];

    await expect(
      generateBuilderCode(
        "Build a landing page",
        vi.fn(),
        async () => ({ ok: false, message: "planner boom" }),
        undefined,
        "build",
        undefined,
        {
          orchestrationMode: "pro",
          preferServerAi: true,
          onTraceUpdate: (trace) => traces.push(trace),
        },
      ),
    ).rejects.toMatchObject({ step: "planning" });

    const finalTrace = traces.at(-1)!;
    expect(finalTrace.steps.find((step) => step.id === "planning")?.status).toBe("failed");
    expect(finalTrace.steps.find((step) => step.id === "building")?.status).toBe("skipped");
  });

  it("records cancelled trace when generation is aborted", async () => {
    vi.useFakeTimers();
    try {
      saveBuilderOrchestrationMode("fast");
      const controller = new AbortController();
      const traces: ReturnType<typeof createBuilderGenerationTrace>[] = [];
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
          onTraceUpdate: (trace) => traces.push(trace),
        },
      );

      await vi.advanceTimersByTimeAsync(250);

      expect(traces.at(-1)?.steps.find((step) => step.id === "building")?.status).toBe("running");

      controller.abort();
      await expect(promise).rejects.toMatchObject({ name: "BuilderGenerationAbortedError" });

      const finalTrace = traces.at(-1)!;
      expect(finalTrace.steps.find((step) => step.id === "building")?.status).toBe("cancelled");
    } finally {
      vi.useRealTimers();
    }
  });
});
