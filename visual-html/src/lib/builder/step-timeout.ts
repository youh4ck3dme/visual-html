import type { BuilderTraceStepId } from "@/lib/builder/generation-trace";
import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

/** Server Mistral fetch default is 55s (max 58s). Step limits must exceed that budget. */
export const SERVER_AI_STEP_TIMEOUT_MS = 60_000;
export const HEAVY_AI_STEP_TIMEOUT_MS = 75_000;
export const FAST_BUILDING_TIMEOUT_MS = 60_000;

export const STEP_TIMEOUT_MS: Record<BuilderTraceStepId, number> = {
  planning: SERVER_AI_STEP_TIMEOUT_MS,
  building: HEAVY_AI_STEP_TIMEOUT_MS,
  buildingA: HEAVY_AI_STEP_TIMEOUT_MS,
  buildingB: HEAVY_AI_STEP_TIMEOUT_MS,
  judging: SERVER_AI_STEP_TIMEOUT_MS,
  reviewing: HEAVY_AI_STEP_TIMEOUT_MS,
  finalizing: 5_000,
};

export function getStepTimeoutMs(
  stepId: BuilderTraceStepId,
  mode: BuilderOrchestrationMode,
  override?: number,
): number {
  if (override != null) return override;
  if (stepId === "building" && mode === "fast") return FAST_BUILDING_TIMEOUT_MS;
  return STEP_TIMEOUT_MS[stepId];
}
