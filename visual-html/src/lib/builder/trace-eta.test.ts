import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { BuilderGenerationTrace } from "@/lib/builder/generation-trace";
import {
  averageTraceDurationMs,
  estimateRemainingMs,
  recordTraceDuration,
} from "@/lib/builder/trace-eta";

const STORAGE_KEY = "pngto-builder-trace-durations";

function makeTrace(startedAt: number): BuilderGenerationTrace {
  return {
    mode: "fast",
    startedAt,
    steps: [],
  };
}

describe("trace-eta", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("records and averages trace durations", () => {
    recordTraceDuration(10_000);
    recordTraceDuration(20_000);
    expect(averageTraceDurationMs()).toBe(15_000);
  });

  it("keeps only the last 12 samples", () => {
    for (let i = 1; i <= 14; i += 1) {
      recordTraceDuration(i * 1000);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const samples = JSON.parse(raw!) as number[];
    expect(samples).toHaveLength(12);
    expect(samples[0]).toBe(3000);
    expect(samples.at(-1)).toBe(14_000);
  });

  it("estimates remaining time from rolling average", () => {
    recordTraceDuration(10_000);
    const startedAt = Date.now() - 4000;
    const remaining = estimateRemainingMs(makeTrace(startedAt));
    expect(remaining).not.toBeNull();
    expect(remaining!).toBeGreaterThan(5000);
    expect(remaining!).toBeLessThanOrEqual(6000);
  });

  it("returns null when no samples exist", () => {
    expect(estimateRemainingMs(makeTrace(Date.now()))).toBeNull();
  });

  it("returns null when elapsed exceeds average", () => {
    recordTraceDuration(5000);
    const startedAt = Date.now() - 8000;
    expect(estimateRemainingMs(makeTrace(startedAt))).toBeNull();
  });
});
