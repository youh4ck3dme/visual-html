import { describe, expect, it } from "vitest";

import { RETRY_BACKOFF_MS, computeRetryDelayMs } from "@/lib/builder/retry-backoff";

describe("retry backoff", () => {
  it("computes delay within base + jitter range", () => {
    const maxDelay = RETRY_BACKOFF_MS.firstRetryBase + RETRY_BACKOFF_MS.jitter;

    expect(computeRetryDelayMs(() => 0)).toBe(RETRY_BACKOFF_MS.firstRetryBase);
    expect(computeRetryDelayMs(() => 1)).toBe(maxDelay + 1);
    expect(computeRetryDelayMs(() => 0.5)).toBe(
      RETRY_BACKOFF_MS.firstRetryBase + Math.floor(0.5 * (RETRY_BACKOFF_MS.jitter + 1)),
    );
    expect(computeRetryDelayMs(() => 0)).toBeGreaterThanOrEqual(RETRY_BACKOFF_MS.firstRetryBase);
    expect(computeRetryDelayMs(() => 1)).toBeLessThanOrEqual(maxDelay + 1);
  });
});
