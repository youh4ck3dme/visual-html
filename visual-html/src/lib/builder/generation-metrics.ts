import type {
  BuilderGenerationTrace,
  BuilderTraceStep,
  BuilderTraceStepId,
} from "@/lib/builder/generation-trace";
import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

const AI_STEP_IDS = new Set<BuilderTraceStepId>([
  "planning",
  "building",
  "buildingA",
  "buildingB",
  "judging",
  "reviewing",
]);

export type BuilderStepErrorCategory =
  "timeout" | "cancelled" | "auth" | "transient" | "validation" | "unknown";

export type BuilderStepMetrics = {
  id: BuilderTraceStepId;
  status: BuilderTraceStep["status"];
  durationMs?: number;
  retryCount: number;
  timedOut: boolean;
  usedFallback: boolean;
  errorCategory?: BuilderStepErrorCategory;
  aiCalls: number;
};

export type BuilderGenerationMetrics = {
  mode: BuilderOrchestrationMode;
  startedAt?: number;
  endedAt?: number;
  totalDurationMs?: number;
  totalAiCalls: number;
  totalRetries: number;
  totalTimeouts: number;
  totalFallbacks: number;
  wasCancelled: boolean;
  wasSuccessful: boolean;
  failedStep?: BuilderTraceStepId;
  steps: BuilderStepMetrics[];
};

function isAiStep(stepId: BuilderTraceStepId): boolean {
  return AI_STEP_IDS.has(stepId);
}

function isToleratedBeastBuilderFailure(
  trace: BuilderGenerationTrace,
  step: BuilderTraceStep,
): boolean {
  if (trace.mode !== "beast" || (step.id !== "buildingA" && step.id !== "buildingB")) {
    return false;
  }
  const otherId = step.id === "buildingA" ? "buildingB" : "buildingA";
  return trace.steps.find((candidate) => candidate.id === otherId)?.status === "success";
}

function categorizeStepError(step: BuilderTraceStep): BuilderStepErrorCategory | undefined {
  if (step.status === "cancelled") return "cancelled";
  if (step.status !== "failed") return undefined;

  const message = `${step.errorMessage ?? ""} ${step.lastErrorMessage ?? ""}`.toLowerCase();
  if (
    step.timedOut ||
    (/time limit|timed out/i.test(message) && !/network|fetch failed/i.test(message))
  ) {
    return "timeout";
  }
  if (/401|unauthorized|api key/i.test(message)) return "auth";
  if (/validation|needs an existing app|unsupported/i.test(message)) return "validation";
  if (
    /network|timeout|503|502|504|429|empty.*response|temporary|transient|fetch failed/i.test(
      message,
    )
  ) {
    return "transient";
  }
  return "unknown";
}

function countStepAiCalls(step: BuilderTraceStep): number {
  if (!isAiStep(step.id)) return 0;
  if (step.status === "pending" || step.status === "skipped") return 0;
  if (step.attemptCount != null) return step.attemptCount;
  if (step.status === "success" || step.status === "failed") {
    return 1 + (step.retryCount ?? 0);
  }
  if (step.status === "cancelled") {
    return Math.max(0, step.retryCount ?? 0);
  }
  return 0;
}

function mapStepMetrics(step: BuilderTraceStep): BuilderStepMetrics {
  return {
    id: step.id,
    status: step.status,
    durationMs: step.durationMs,
    retryCount: step.retryCount ?? 0,
    timedOut: Boolean(step.timedOut),
    usedFallback: Boolean(step.usedFallback),
    errorCategory: categorizeStepError(step),
    aiCalls: countStepAiCalls(step),
  };
}

function isBlockingFailure(trace: BuilderGenerationTrace, step: BuilderTraceStep): boolean {
  if (step.status !== "failed" || step.usedFallback) return false;
  return !isToleratedBeastBuilderFailure(trace, step);
}

export function createMetricsFromTrace(trace: BuilderGenerationTrace): BuilderGenerationMetrics {
  const steps = trace.steps.map(mapStepMetrics);
  const blockingFailure = trace.steps.find((step) => isBlockingFailure(trace, step));
  const failedStep = blockingFailure ?? trace.steps.find((step) => step.status === "failed");
  const wasCancelled = trace.steps.some((step) => step.status === "cancelled");

  return {
    mode: trace.mode,
    startedAt: trace.startedAt,
    endedAt: trace.finishedAt,
    totalDurationMs: trace.totalDurationMs,
    totalAiCalls: steps.reduce((sum, step) => sum + step.aiCalls, 0),
    totalRetries: steps.reduce((sum, step) => sum + step.retryCount, 0),
    totalTimeouts: steps.filter((step) => step.timedOut).length,
    totalFallbacks: steps.filter((step) => step.usedFallback).length,
    wasCancelled,
    wasSuccessful: !wasCancelled && !blockingFailure && trace.finishedAt != null,
    failedStep: failedStep?.id,
    steps,
  };
}
