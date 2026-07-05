import type { BuilderGenerationTrace } from "@/lib/builder/generation-trace";

const STORAGE_KEY = "pngto-builder-trace-durations";
const MAX_SAMPLES = 12;

export function recordTraceDuration(totalDurationMs: number): void {
  if (typeof localStorage === "undefined" || totalDurationMs <= 0) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const samples: number[] = raw ? (JSON.parse(raw) as number[]) : [];
    samples.push(totalDurationMs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples.slice(-MAX_SAMPLES)));
  } catch {
    /* quota */
  }
}

export function averageTraceDurationMs(): number | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const samples = JSON.parse(raw) as number[];
    if (!samples.length) return null;
    const sum = samples.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / samples.length);
  } catch {
    return null;
  }
}

export function estimateRemainingMs(trace: BuilderGenerationTrace): number | null {
  const average = averageTraceDurationMs();
  if (average == null || trace.startedAt == null) return null;

  const elapsed = Date.now() - trace.startedAt;
  const remaining = average - elapsed;
  return remaining > 0 ? remaining : null;
}
