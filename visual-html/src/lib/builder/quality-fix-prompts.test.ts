import { describe, expect, it } from "vitest";

import { runHtmlHealthCheck } from "@/lib/builder/html-health-check";
import { resolveBuilderQualityProfile } from "@/lib/builder/quality-profiles";
import {
  APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT,
  IPHONE_AIR_HTML_FIX_PROMPT,
  SEO_REFINEMENT_INSTRUCTION,
  resolveQualityPolishFixPrompt,
  shouldOfferQualityPolishFix,
} from "@/lib/builder/quality-fix-prompts";

const ANIMATED_NO_POLISH_HTML = `<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>Demo</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; }
  .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
  .card { width: 1200px; animation: float 3s infinite; }
  @keyframes float { to { transform: translateY(-8px); } }
  button { padding: 8px 16px; }
</style></head><body>
<section class="hero"><div class="card"><button>Go</button></div></section>
</body></html>`;

describe("quality-fix-prompts", () => {
  it("exports a non-empty Apple Glass polish fix prompt", () => {
    expect(APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT).toContain("prefers-reduced-motion");
    expect(APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT).toContain(":focus-visible");
    expect(APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT).toContain("max-width: 480px");
  });

  it("exports a non-empty iPhone Air HTML fix prompt", () => {
    expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("420×912");
    expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("393×852");
    expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("safe-area-inset-bottom");
    expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("max-width: 420px");
  });

  it("resolveQualityPolishFixPrompt — pwa-mobile uses iPhone Air prompt", () => {
    expect(resolveQualityPolishFixPrompt("pwa-mobile")).toBe(IPHONE_AIR_HTML_FIX_PROMPT);
  });

  it("resolveQualityPolishFixPrompt — apple-glass uses Apple Glass prompt", () => {
    expect(resolveQualityPolishFixPrompt("apple-glass")).toBe(
      APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT,
    );
  });

  it("resolveQualityPolishFixPrompt — auto with PWA prompt resolves to iPhone Air", () => {
    expect(resolveQualityPolishFixPrompt("auto", "Build a PWA mobile app shell")).toBe(
      IPHONE_AIR_HTML_FIX_PROMPT,
    );
  });

  it("shouldOfferQualityPolishFix — true when score below profile minimum", () => {
    const profile = resolveBuilderQualityProfile("apple-glass", "landing");
    const health = runHtmlHealthCheck(ANIMATED_NO_POLISH_HTML, { qualityProfile: profile });
    expect(shouldOfferQualityPolishFix(health, profile.healthExpectations.minimumScore)).toBe(true);
  });

  it("shouldOfferQualityPolishFix — true when motion/focus/responsive warnings present", () => {
    const profile = resolveBuilderQualityProfile("apple-glass", "apple glass landing");
    const health = runHtmlHealthCheck(ANIMATED_NO_POLISH_HTML, {
      qualityProfile: profile,
      userPrompt: "apple glass premium landing",
    });
    expect(shouldOfferQualityPolishFix(health)).toBe(true);
  });

  it("SEO_REFINEMENT_INSTRUCTION includes meta and semantic guidance", () => {
    expect(SEO_REFINEMENT_INSTRUCTION).toContain("<title>");
    expect(SEO_REFINEMENT_INSTRUCTION).toContain("meta name=\"description\"");
    expect(SEO_REFINEMENT_INSTRUCTION).toContain("og:title");
    expect(SEO_REFINEMENT_INSTRUCTION).toMatch(/semantic/i);
  });

  it("shouldOfferQualityPolishFix — false when no matching findings", () => {
    const health = runHtmlHealthCheck("", {});
    expect(shouldOfferQualityPolishFix(health)).toBe(false);
  });
});
