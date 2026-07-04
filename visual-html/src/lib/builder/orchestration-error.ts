import type { BuilderTraceContext, BuilderTraceStepId } from "@/lib/builder/generation-trace";
import {
  emitTraceUpdate,
  finalizeBuilderGenerationTrace,
  markRemainingStepsSkipped,
  updateTraceStep,
} from "@/lib/builder/generation-trace";
import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";
import { computeRetryDelayMs } from "@/lib/builder/retry-backoff";
import { getStepTimeoutMs } from "@/lib/builder/step-timeout";

export type BuilderGenerationStep =
  "connecting" | "planning" | "building" | "reviewing" | "judging" | "explaining" | "finalizing";

export const DEFAULT_STEP_MAX_RETRIES = 1;

const NON_RETRYABLE_PATTERNS = [
  /abort/i,
  /cancel/i,
  /401|unauthorized/i,
  /missing.*api key/i,
  /no.*mistral.*key/i,
  /api key rejected/i,
  /needs an existing app/i,
  /unsupported/i,
  /validation/i,
  /content.?safety/i,
  /blocked by/i,
  /policy violation/i,
] as const;

const RETRYABLE_PATTERNS = [
  /timeout/i,
  /timed out/i,
  /network/i,
  /econnreset/i,
  /fetch failed/i,
  /\b503\b/,
  /\b502\b/,
  /\b504\b/,
  /\b429\b/,
  /rate limit/i,
  /too many requests/i,
  /empty.*response/i,
  /empty.*mistral/i,
  /empty.*server ai/i,
  /malformed/i,
  /invalid response/i,
  /temporary/i,
  /server.*failed/i,
  /transient/i,
  /time limit/i,
] as const;

export class BuilderOrchestrationError extends Error {
  constructor(
    message: string,
    public readonly step: BuilderGenerationStep,
    public readonly mode: BuilderOrchestrationMode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BuilderOrchestrationError";
  }
}

export class BuilderGenerationAbortedError extends BuilderOrchestrationError {
  constructor(step: BuilderGenerationStep, mode: BuilderOrchestrationMode) {
    super("Generation cancelled.", step, mode);
    this.name = "BuilderGenerationAbortedError";
  }
}

export class BuilderStepTimeoutError extends Error {
  constructor(
    public readonly timeoutMs: number,
    public readonly step: BuilderGenerationStep,
  ) {
    super(`Step timed out after ${timeoutMs}ms`);
    this.name = "BuilderStepTimeoutError";
  }
}

export type RunBuilderStepOptions = {
  maxRetries?: number;
  failSoft?: boolean;
  timeoutMs?: number;
  computeRetryDelayMs?: () => number;
};

export type RunBuilderStepAction<T> = (attemptSignal: AbortSignal | undefined) => Promise<T>;

export function isAbortError(error: unknown): boolean {
  if (error instanceof BuilderGenerationAbortedError) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  return false;
}

export function isTimeoutError(error: unknown): error is BuilderStepTimeoutError {
  return error instanceof BuilderStepTimeoutError;
}

export function isBuilderOrchestrationError(error: unknown): error is BuilderOrchestrationError {
  return error instanceof BuilderOrchestrationError;
}

export function formatCauseMessage(cause: unknown): string {
  if (isTimeoutError(cause)) {
    return `Step exceeded the time limit (${cause.timeoutMs}ms).`;
  }
  if (cause instanceof Error && cause.message.trim()) return cause.message.trim();
  if (typeof cause === "string" && cause.trim()) return cause.trim();
  return "Unknown error";
}

export function isRetryableError(error: unknown): boolean {
  if (isAbortError(error)) return false;
  if (isTimeoutError(error)) return true;
  if (error instanceof BuilderOrchestrationError && isAbortError(error.cause)) return false;
  if (error instanceof BuilderOrchestrationError && isTimeoutError(error.cause)) return true;

  const message = formatCauseMessage(error);
  if (NON_RETRYABLE_PATTERNS.some((pattern) => pattern.test(message))) return false;
  return RETRYABLE_PATTERNS.some((pattern) => pattern.test(message));
}

const FALLBACK_SAFE_PATTERNS = [
  /missing server key/i,
  /no server key/i,
  /server also failed/i,
  /server.*unavailable/i,
] as const;

export function isFallbackSafeError(error: unknown): boolean {
  if (isAbortError(error)) return false;
  if (isTimeoutError(error)) return true;

  const message = formatCauseMessage(error);
  if (NON_RETRYABLE_PATTERNS.some((pattern) => pattern.test(message))) return false;
  if (FALLBACK_SAFE_PATTERNS.some((pattern) => pattern.test(message))) return true;
  if (isRetryableError(error)) return true;
  if (isBuilderOrchestrationError(error)) return false;
  return true;
}

export function assertNotAborted(
  signal: AbortSignal | undefined,
  step: BuilderGenerationStep,
  mode: BuilderOrchestrationMode,
): void {
  if (signal?.aborted) {
    throw new BuilderGenerationAbortedError(step, mode);
  }
}

function mergeAbortSignals(
  parentSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal,
): AbortSignal {
  if (
    typeof AbortSignal !== "undefined" &&
    "any" in AbortSignal &&
    typeof AbortSignal.any === "function"
  ) {
    return parentSignal ? AbortSignal.any([parentSignal, timeoutSignal]) : timeoutSignal;
  }

  const composite = new AbortController();
  const forwardAbort = () => composite.abort();

  parentSignal?.addEventListener("abort", forwardAbort, { once: true });
  timeoutSignal.addEventListener("abort", forwardAbort, { once: true });

  if (parentSignal?.aborted || timeoutSignal.aborted) {
    forwardAbort();
  }

  return composite.signal;
}

export async function runStepWithTimeout<T>(
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
  step: BuilderGenerationStep,
  mode: BuilderOrchestrationMode,
  action: RunBuilderStepAction<T>,
): Promise<T> {
  if (parentSignal?.aborted) {
    throw new BuilderGenerationAbortedError(step, mode);
  }

  let timedOut = false;
  const timeoutController = new AbortController();

  const timer = globalThis.setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, timeoutMs);

  const onParentAbort = () => {
    globalThis.clearTimeout(timer);
    timeoutController.abort();
  };

  parentSignal?.addEventListener("abort", onParentAbort, { once: true });

  const attemptSignal = mergeAbortSignals(parentSignal, timeoutController.signal);

  try {
    const result = await action(attemptSignal);

    if (parentSignal?.aborted) {
      throw new BuilderGenerationAbortedError(step, mode);
    }
    if (timedOut) {
      throw new BuilderStepTimeoutError(timeoutMs, step);
    }

    return result;
  } catch (error) {
    if (parentSignal?.aborted) {
      throw error instanceof BuilderGenerationAbortedError
        ? error
        : new BuilderGenerationAbortedError(step, mode);
    }
    if (timedOut) {
      throw new BuilderStepTimeoutError(timeoutMs, step);
    }
    if (isAbortError(error)) {
      throw new BuilderGenerationAbortedError(step, mode);
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timer);
    parentSignal?.removeEventListener("abort", onParentAbort);
  }
}

function markTraceStepCancelled(traceContext: BuilderTraceContext, startedAt: number): void {
  const finishedAt = Date.now();
  updateTraceStep(traceContext.trace, traceContext.stepId, {
    status: "cancelled",
    startedAt:
      traceContext.trace.steps.find((step) => step.id === traceContext.stepId)?.startedAt ??
      startedAt,
    finishedAt,
    durationMs: finishedAt - startedAt,
  });
  markRemainingStepsSkipped(traceContext.trace, traceContext.stepId);
  finalizeBuilderGenerationTrace(traceContext.trace);
  emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
}

function markTraceStepFailed(
  traceContext: BuilderTraceContext,
  attemptStartedAt: number,
  errorMessage: string,
  retryCount: number,
  maxRetries: number,
  timeoutMs: number,
  timedOut: boolean,
): void {
  const finishedAt = Date.now();
  updateTraceStep(traceContext.trace, traceContext.stepId, {
    status: "failed",
    finishedAt,
    durationMs: finishedAt - attemptStartedAt,
    errorMessage,
    retryCount,
    maxRetries,
    timeoutMs,
    timedOut,
  });
  markRemainingStepsSkipped(traceContext.trace, traceContext.stepId);
  finalizeBuilderGenerationTrace(traceContext.trace);
  emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
}

function markTraceStepFailedSoft(
  traceContext: BuilderTraceContext,
  attemptStartedAt: number,
  errorMessage: string,
  retryCount: number,
  maxRetries: number,
  timeoutMs: number,
  timedOut: boolean,
  lastErrorMessage?: string,
): void {
  const finishedAt = Date.now();
  updateTraceStep(traceContext.trace, traceContext.stepId, {
    status: "failed",
    finishedAt,
    durationMs: finishedAt - attemptStartedAt,
    errorMessage,
    lastErrorMessage: lastErrorMessage ?? errorMessage,
    retryCount,
    maxRetries,
    timeoutMs,
    timedOut,
  });
  emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
}

function markTraceStepSuccess(
  traceContext: BuilderTraceContext,
  attemptStartedAt: number,
  retryCount: number,
  maxRetries: number,
  timeoutMs: number,
  lastErrorMessage?: string,
): void {
  const finishedAt = Date.now();
  updateTraceStep(traceContext.trace, traceContext.stepId, {
    status: "success",
    finishedAt,
    durationMs: finishedAt - attemptStartedAt,
    retryCount,
    maxRetries,
    timeoutMs,
    timedOut: false,
    lastErrorMessage,
    errorMessage: undefined,
  });
  emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
}

function markTraceStepRunning(
  traceContext: BuilderTraceContext,
  attemptStartedAt: number,
  status: "running" | "retrying",
  retryCount: number,
  maxRetries: number,
  timeoutMs: number,
  lastErrorMessage?: string,
  timedOut?: boolean,
): void {
  updateTraceStep(traceContext.trace, traceContext.stepId, {
    status,
    startedAt: attemptStartedAt,
    retryCount,
    maxRetries,
    timeoutMs,
    lastErrorMessage,
    timedOut,
    attemptCount: retryCount + 1,
  });
  emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
}

export async function runBuilderStep<T>(
  step: BuilderGenerationStep,
  mode: BuilderOrchestrationMode,
  signal: AbortSignal | undefined,
  action: RunBuilderStepAction<T>,
  traceContext?: BuilderTraceContext,
  options?: RunBuilderStepOptions & { failSoft?: false },
): Promise<T>;
export async function runBuilderStep<T>(
  step: BuilderGenerationStep,
  mode: BuilderOrchestrationMode,
  signal: AbortSignal | undefined,
  action: RunBuilderStepAction<T>,
  traceContext: BuilderTraceContext | undefined,
  options: RunBuilderStepOptions & { failSoft: true },
): Promise<T | null>;
export async function runBuilderStep<T>(
  step: BuilderGenerationStep,
  mode: BuilderOrchestrationMode,
  signal: AbortSignal | undefined,
  action: RunBuilderStepAction<T>,
  traceContext?: BuilderTraceContext,
  options: RunBuilderStepOptions = {},
): Promise<T | null> {
  const maxRetries = options.maxRetries ?? traceContext?.maxRetries ?? DEFAULT_STEP_MAX_RETRIES;
  const failSoft = options.failSoft ?? false;
  const timeoutMs =
    options.timeoutMs ??
    traceContext?.timeoutMs ??
    (traceContext
      ? getStepTimeoutMs(traceContext.stepId, mode)
      : getStepTimeoutMs("building", mode));
  let attempt = 0;
  let lastErrorMessage: string | undefined;

  while (attempt <= maxRetries) {
    const attemptStartedAt = Date.now();
    const isRetry = attempt > 0;

    try {
      assertNotAborted(signal, step, mode);
    } catch (error) {
      if (traceContext && isAbortError(error)) {
        markTraceStepCancelled(traceContext, attemptStartedAt);
      }
      throw error;
    }

    if (traceContext) {
      markTraceStepRunning(
        traceContext,
        attemptStartedAt,
        isRetry ? "retrying" : "running",
        attempt,
        maxRetries,
        timeoutMs,
        isRetry ? lastErrorMessage : undefined,
      );
    }

    try {
      const result = await runStepWithTimeout(signal, timeoutMs, step, mode, action);
      assertNotAborted(signal, step, mode);

      if (traceContext) {
        markTraceStepSuccess(
          traceContext,
          attemptStartedAt,
          attempt,
          maxRetries,
          timeoutMs,
          attempt > 0 ? lastErrorMessage : undefined,
        );
      }

      return result;
    } catch (error) {
      if (isAbortError(error)) {
        if (traceContext) {
          markTraceStepCancelled(traceContext, attemptStartedAt);
        }
        throw error instanceof BuilderGenerationAbortedError
          ? error
          : new BuilderGenerationAbortedError(step, mode);
      }

      const timedOut = isTimeoutError(error);
      const errorMessage = formatCauseMessage(error);
      const canRetry = attempt < maxRetries && isRetryableError(error);

      if (canRetry) {
        lastErrorMessage = errorMessage;
        const retryDelayMs = (options.computeRetryDelayMs ?? computeRetryDelayMs)();
        if (traceContext) {
          updateTraceStep(traceContext.trace, traceContext.stepId, {
            status: "waitingToRetry",
            lastErrorMessage: errorMessage,
            retryCount: attempt + 1,
            maxRetries,
            timeoutMs,
            timedOut,
            retryDelayMs,
            attemptCount: attempt + 1,
          });
          emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
        }
        try {
          await abortableSleep(retryDelayMs, signal, step, mode);
        } catch (delayError) {
          if (traceContext && isAbortError(delayError)) {
            markTraceStepCancelled(traceContext, attemptStartedAt);
          }
          throw delayError;
        }
        if (traceContext) {
          updateTraceStep(traceContext.trace, traceContext.stepId, {
            retryStartedAt: Date.now(),
          });
          emitTraceUpdate(traceContext.trace, traceContext.onTraceUpdate);
        }
        attempt += 1;
        continue;
      }

      if (traceContext) {
        if (failSoft) {
          markTraceStepFailedSoft(
            traceContext,
            attemptStartedAt,
            errorMessage,
            attempt,
            maxRetries,
            timeoutMs,
            timedOut,
            lastErrorMessage,
          );
        } else {
          markTraceStepFailed(
            traceContext,
            attemptStartedAt,
            errorMessage,
            attempt,
            maxRetries,
            timeoutMs,
            timedOut,
          );
        }
      }

      if (failSoft) {
        return null;
      }

      throw new BuilderOrchestrationError(errorMessage, step, mode, error);
    }
  }

  return null;
}

export async function abortableSleep(
  ms: number,
  signal: AbortSignal | undefined,
  step: BuilderGenerationStep,
  mode: BuilderOrchestrationMode,
): Promise<void> {
  assertNotAborted(signal, step, mode);

  await new Promise<void>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      globalThis.clearTimeout(timer);
      reject(new BuilderGenerationAbortedError(step, mode));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });

  assertNotAborted(signal, step, mode);
}

export type { BuilderTraceStepId };
