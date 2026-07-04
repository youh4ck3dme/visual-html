import { describe, expect, it } from "vitest";

import {
  HEAVY_AI_STEP_TIMEOUT_MS,
  SERVER_AI_STEP_TIMEOUT_MS,
  getStepTimeoutMs,
} from "@/lib/builder/step-timeout";

/** Matches mistral.server.ts DEFAULT_TIMEOUT_MS / MAX_TIMEOUT_MS envelope. */
const MISTRAL_SERVER_TIMEOUT_MS = 55_000;

describe("builder step timeouts", () => {
  it("keeps AI step limits above the server Mistral fetch budget", () => {
    expect(SERVER_AI_STEP_TIMEOUT_MS).toBeGreaterThan(MISTRAL_SERVER_TIMEOUT_MS);
    expect(HEAVY_AI_STEP_TIMEOUT_MS).toBeGreaterThan(MISTRAL_SERVER_TIMEOUT_MS);
    expect(getStepTimeoutMs("reviewing", "pro")).toBeGreaterThan(MISTRAL_SERVER_TIMEOUT_MS);
    expect(getStepTimeoutMs("planning", "pro")).toBeGreaterThan(MISTRAL_SERVER_TIMEOUT_MS);
  });
});
