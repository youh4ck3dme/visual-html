import { describe, expect, it } from "vitest";

import { runHtmlHealthCheck } from "@/lib/builder/html-health-check";
import { resolveBuilderQualityProfile } from "@/lib/builder/quality-profiles";
import {
  APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT,
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

  it("shouldOfferQualityPolishFix — true when motion/focus/responsive warnings present", () => {
    const profile = resolveBuilderQualityProfile("apple-glass", "apple glass landing");
    const health = runHtmlHealthCheck(ANIMATED_NO_POLISH_HTML, {
      qualityProfile: profile,
      userPrompt: "apple glass premium landing",
    });
    expect(shouldOfferQualityPolishFix(health)).toBe(true);
  });

  it("shouldOfferQualityPolishFix — false when no matching findings", () => {
    const health = runHtmlHealthCheck("", {});
    expect(shouldOfferQualityPolishFix(health)).toBe(false);
  });
});
