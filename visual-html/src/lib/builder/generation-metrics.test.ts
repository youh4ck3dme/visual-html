import { describe, expect, it } from "vitest";

import { createBuilderGenerationTrace } from "@/lib/builder/generation-trace";
import { createMetricsFromTrace } from "@/lib/builder/generation-metrics";
import { finalizeBuilderGenerationTrace, updateTraceStep } from "@/lib/builder/generation-trace";

describe("builder generation metrics", () => {
  it("counts pro mode AI calls without retries", () => {
    const trace = createBuilderGenerationTrace("pro");
    trace.startedAt = Date.now();
    for (const stepId of ["planning", "building", "reviewing", "finalizing"] as const) {
      updateTraceStep(trace, stepId, {
        status: stepId === "finalizing" ? "success" : "success",
        attemptCount: stepId === "finalizing" ? undefined : 1,
        retryCount: 0,
        durationMs: 100,
      });
    }
    finalizeBuilderGenerationTrace(trace);

    const metrics = createMetricsFromTrace(trace);
    expect(metrics.totalAiCalls).toBe(3);
    expect(metrics.totalRetries).toBe(0);
    expect(metrics.wasSuccessful).toBe(true);
  });

  it("counts builder retry as an extra AI call", () => {
    const trace = createBuilderGenerationTrace("pro");
    updateTraceStep(trace, "planning", { status: "success", attemptCount: 1, retryCount: 0 });
    updateTraceStep(trace, "building", { status: "success", attemptCount: 2, retryCount: 1 });
    updateTraceStep(trace, "reviewing", { status: "success", attemptCount: 1, retryCount: 0 });
    updateTraceStep(trace, "finalizing", { status: "success" });
    finalizeBuilderGenerationTrace(trace);

    const metrics = createMetricsFromTrace(trace);
    expect(metrics.totalAiCalls).toBe(4);
    expect(metrics.totalRetries).toBe(1);
  });

  it("counts beast mode with skipped judge when one builder fails", () => {
    const trace = createBuilderGenerationTrace("beast");
    updateTraceStep(trace, "planning", { status: "success", attemptCount: 1, retryCount: 0 });
    updateTraceStep(trace, "buildingA", { status: "success", attemptCount: 1, retryCount: 0 });
    updateTraceStep(trace, "buildingB", { status: "failed", attemptCount: 1, retryCount: 0 });
    updateTraceStep(trace, "judging", { status: "skipped" });
    updateTraceStep(trace, "reviewing", { status: "success", attemptCount: 1, retryCount: 0 });
    updateTraceStep(trace, "finalizing", { status: "success" });
    finalizeBuilderGenerationTrace(trace);

    const metrics = createMetricsFromTrace(trace);
    expect(metrics.totalAiCalls).toBe(4);
    expect(metrics.wasSuccessful).toBe(true);
  });

  it("counts timeout and fallback metrics", () => {
    const trace = createBuilderGenerationTrace("fast");
    updateTraceStep(trace, "building", {
      status: "failed",
      attemptCount: 2,
      retryCount: 1,
      timedOut: true,
      usedFallback: true,
      errorMessage: "Step exceeded the time limit.",
    });
    updateTraceStep(trace, "finalizing", { status: "skipped" });
    finalizeBuilderGenerationTrace(trace);

    const metrics = createMetricsFromTrace(trace);
    expect(metrics.totalTimeouts).toBe(1);
    expect(metrics.totalFallbacks).toBe(1);
    expect(metrics.totalAiCalls).toBe(2);
    expect(metrics.wasSuccessful).toBe(true);
  });

  it("marks cancelled generation", () => {
    const trace = createBuilderGenerationTrace("fast");
    updateTraceStep(trace, "building", {
      status: "cancelled",
      attemptCount: 1,
      retryCount: 0,
    });
    updateTraceStep(trace, "finalizing", { status: "skipped" });
    finalizeBuilderGenerationTrace(trace);

    const metrics = createMetricsFromTrace(trace);
    expect(metrics.wasCancelled).toBe(true);
    expect(metrics.wasSuccessful).toBe(false);
  });

  it("marks failed step after retry exhaustion", () => {
    const trace = createBuilderGenerationTrace("pro");
    updateTraceStep(trace, "planning", {
      status: "failed",
      attemptCount: 2,
      retryCount: 1,
      errorMessage: "fetch failed",
    });
    updateTraceStep(trace, "building", { status: "skipped" });
    finalizeBuilderGenerationTrace(trace);

    const metrics = createMetricsFromTrace(trace);
    expect(metrics.failedStep).toBe("planning");
    expect(metrics.wasSuccessful).toBe(false);
    expect(metrics.steps[0]?.errorCategory).toBe("transient");
  });
});
