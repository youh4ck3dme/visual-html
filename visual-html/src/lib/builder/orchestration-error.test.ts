import { describe, expect, it } from "vitest";

import {
  BuilderGenerationAbortedError,
  BuilderOrchestrationError,
  isAbortError,
  runBuilderStep,
} from "@/lib/builder/orchestration-error";

describe("builder orchestration errors", () => {
  it("wraps step failures in BuilderOrchestrationError", async () => {
    await expect(
      runBuilderStep("planning", "pro", undefined, async () => {
        throw new Error("planner boom");
      }),
    ).rejects.toMatchObject({
      name: "BuilderOrchestrationError",
      step: "planning",
      mode: "pro",
      message: "planner boom",
    });
  });

  it("throws aborted errors when signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      runBuilderStep("building", "beast", controller.signal, async () => "ok"),
    ).rejects.toBeInstanceOf(BuilderGenerationAbortedError);
  });

  it("detects abort errors", () => {
    expect(isAbortError(new BuilderGenerationAbortedError("finalizing", "pro"))).toBe(true);
    expect(isAbortError(new DOMException("aborted", "AbortError"))).toBe(true);
    expect(isAbortError(new BuilderOrchestrationError("fail", "planning", "pro"))).toBe(false);
  });
});
