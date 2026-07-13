import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

export type BuilderTraceStepStatus =
  | "pending"
  | "running"
  | "waitingToRetry"
  | "retrying"
  | "success"
  | "failed"
  | "cancelled"
  | "skipped";

export type BuilderTraceStepId =
  | "planning"
  | "building"
  | "buildingA"
  | "buildingB"
  | "judging"
  | "reviewing"
  | "finalizing";

export type BuilderTraceStep = {
  id: BuilderTraceStepId;
  status: BuilderTraceStepStatus;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  lastErrorMessage?: string;
  timeoutMs?: number;
  timedOut?: boolean;
  usedFallback?: boolean;
  retryDelayMs?: number;
  retryStartedAt?: number;
  attemptCount?: number;
};

export type BuilderGenerationTrace = {
  mode: BuilderOrchestrationMode;
  steps: BuilderTraceStep[];
  startedAt?: number;
  finishedAt?: number;
  totalDurationMs?: number;
};

export type BuilderTraceContext = {
  trace: BuilderGenerationTrace;
  stepId: BuilderTraceStepId;
  onTraceUpdate?: (trace: BuilderGenerationTrace) => void;
  maxRetries?: number;
  timeoutMs?: number;
};

export function markTraceStepFallbackUsed(
  trace: BuilderGenerationTrace,
  onTraceUpdate?: (trace: BuilderGenerationTrace) => void,
): void {
  const failedStep = trace.steps.find((step) => step.status === "failed");
  if (!failedStep) return;
  updateTraceStep(trace, failedStep.id, { usedFallback: true });
  emitTraceUpdate(trace, onTraceUpdate);
}

export function getTraceStepIdsForMode(mode: BuilderOrchestrationMode): BuilderTraceStepId[] {
  switch (mode) {
    case "fast":
      return ["building", "finalizing"];
    case "pro":
      return ["planning", "building", "reviewing", "finalizing"];
    case "beast":
      return ["planning", "buildingA", "buildingB", "judging", "reviewing", "finalizing"];
  }
}

export function createBuilderGenerationTrace(
  mode: BuilderOrchestrationMode,
): BuilderGenerationTrace {
  return {
    mode,
    steps: getTraceStepIdsForMode(mode).map((id) => ({ id, status: "pending" })),
  };
}

export function cloneBuilderGenerationTrace(trace: BuilderGenerationTrace): BuilderGenerationTrace {
  return {
    ...trace,
    steps: trace.steps.map((step) => ({ ...step })),
  };
}

export function emitTraceUpdate(
  trace: BuilderGenerationTrace,
  onTraceUpdate?: (trace: BuilderGenerationTrace) => void,
): void {
  onTraceUpdate?.(cloneBuilderGenerationTrace(trace));
}

export function updateTraceStep(
  trace: BuilderGenerationTrace,
  stepId: BuilderTraceStepId,
  patch: Partial<BuilderTraceStep>,
): void {
  const step = trace.steps.find((item) => item.id === stepId);
  if (step) Object.assign(step, patch);
}

export function markTraceStepSkipped(
  trace: BuilderGenerationTrace,
  stepId: BuilderTraceStepId,
  onTraceUpdate?: (trace: BuilderGenerationTrace) => void,
): void {
  updateTraceStep(trace, stepId, { status: "skipped" });
  emitTraceUpdate(trace, onTraceUpdate);
}

export function markRemainingStepsSkipped(
  trace: BuilderGenerationTrace,
  afterStepId: BuilderTraceStepId,
): void {
  const index = trace.steps.findIndex((step) => step.id === afterStepId);
  if (index < 0) return;

  for (let i = index + 1; i < trace.steps.length; i += 1) {
    const step = trace.steps[i];
    if (step.status === "pending" || step.status === "running") {
      step.status = "skipped";
    }
  }
}

export function finalizeBuilderGenerationTrace(trace: BuilderGenerationTrace): void {
  const now = Date.now();
  trace.finishedAt = now;
  if (trace.startedAt != null) {
    trace.totalDurationMs = now - trace.startedAt;
  }
}

export function traceHasFailedStep(trace: BuilderGenerationTrace): boolean {
  return trace.steps.some((step) => step.status === "failed");
}

export function formatTraceDuration(ms?: number): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
