import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  confirmBeastMode,
  DEFAULT_BUILDER_ORCHESTRATION_MODE,
  getBuilderOrchestrationMode,
  hasBeastModeBeenConfirmed,
  saveBuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";

describe("builder orchestration mode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to pro when nothing is stored", () => {
    expect(getBuilderOrchestrationMode()).toBe(DEFAULT_BUILDER_ORCHESTRATION_MODE);
  });

  it("falls back to pro for invalid localStorage values", () => {
    localStorage.setItem("visual-html.builder.orchestrationMode", "turbo-mega");
    expect(getBuilderOrchestrationMode()).toBe("pro");
  });

  it("persists the selected mode", () => {
    saveBuilderOrchestrationMode("beast");
    expect(localStorage.getItem("visual-html.builder.orchestrationMode")).toBe("beast");
    expect(getBuilderOrchestrationMode()).toBe("beast");
  });

  it("tracks beast confirmation separately from orchestration mode", () => {
    expect(hasBeastModeBeenConfirmed()).toBe(false);
    confirmBeastMode();
    expect(hasBeastModeBeenConfirmed()).toBe(true);
  });

  it("migrates legacy storage key to the new key", () => {
    localStorage.setItem("builder_orchestration_mode", "fast");
    expect(getBuilderOrchestrationMode()).toBe("fast");
    expect(localStorage.getItem("visual-html.builder.orchestrationMode")).toBe("fast");
    expect(localStorage.getItem("builder_orchestration_mode")).toBeNull();
  });
});
