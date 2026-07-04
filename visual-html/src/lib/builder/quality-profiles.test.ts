import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_BUILDER_QUALITY_PROFILE_ID,
  getBuilderQualityProfileId,
  resolveBuilderQualityProfile,
  saveBuilderQualityProfileId,
  shouldShowFastModeProfileWarning,
} from "@/lib/builder/quality-profiles";
import { enrichBuildPrompt } from "@/lib/builder/prompt-library";

describe("builder quality profiles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to auto profile", () => {
    expect(getBuilderQualityProfileId()).toBe(DEFAULT_BUILDER_QUALITY_PROFILE_ID);
  });

  it("falls back to auto for invalid localStorage value", () => {
    localStorage.setItem("visual-html.builder.qualityProfile", "turbo-luxury");
    expect(getBuilderQualityProfileId()).toBe("auto");
  });

  it("persists selected profile", () => {
    saveBuilderQualityProfileId("neon-parallax");
    expect(getBuilderQualityProfileId()).toBe("neon-parallax");
    expect(localStorage.getItem("visual-html.builder.qualityProfile")).toBe("neon-parallax");
  });

  it("auto resolves neon prompt to neon-parallax", () => {
    const resolved = resolveBuilderQualityProfile("auto", "Build a neon parallax hero");
    expect(resolved.id).toBe("neon-parallax");
  });

  it("auto resolves dashboard prompt to dashboard-pro", () => {
    const resolved = resolveBuilderQualityProfile("auto", "Create an analytics dashboard");
    expect(resolved.id).toBe("dashboard-pro");
  });

  it("auto resolves mobile/PWA prompt to pwa-mobile", () => {
    const resolved = resolveBuilderQualityProfile("auto", "Build a PWA mobile app shell");
    expect(resolved.id).toBe("pwa-mobile");
  });

  it("auto resolves unknown prompt to premium-saas", () => {
    const resolved = resolveBuilderQualityProfile("auto", "Make a notes page for teams");
    expect(resolved.id).toBe("premium-saas");
  });

  it("enrichBuildPrompt includes selected profile enhancer", () => {
    const enriched = enrichBuildPrompt(
      "Build a landing page",
      undefined,
      resolveBuilderQualityProfile("luxury-brand", "Build a landing page"),
    );
    expect(enriched).toContain("Quality profile: Luxury Brand");
    expect(enriched).toContain("Build a landing page");
  });

  it("shows fast warning when profile recommends pro/beast but mode is fast", () => {
    const profile = resolveBuilderQualityProfile("neon-parallax", "neon");
    expect(shouldShowFastModeProfileWarning(profile, "fast")).toBe(true);
    expect(shouldShowFastModeProfileWarning(profile, "beast")).toBe(false);
  });
});
