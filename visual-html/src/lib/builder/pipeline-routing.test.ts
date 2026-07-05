import { describe, expect, it } from "vitest";

import { resolvePipelineMode, scorePromptComplexity } from "@/lib/builder/pipeline-routing";

describe("pipeline-routing", () => {
  it("routes simple landing prompts to fast when pro is requested", () => {
    expect(
      resolvePipelineMode("Build a simple landing page with hero section and CTA", "pro"),
    ).toBe("fast");
  });

  it("routes complex dashboard prompts to beast when pro is requested", () => {
    expect(
      resolvePipelineMode(
        "Build a multi-page admin dashboard with authentication, API integration, kanban board, real-time updates, billing, and team workspaces",
        "pro",
      ),
    ).toBe("beast");
  });

  it("respects explicit fast and beast modes", () => {
    expect(resolvePipelineMode("anything", "fast")).toBe("fast");
    expect(resolvePipelineMode("simple", "beast")).toBe("beast");
  });

  it("scores medium prompts as pro path", () => {
    expect(resolvePipelineMode("Build a pricing page with three tiers and FAQ", "pro")).toBe("pro");
  });
});
