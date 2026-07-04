import { describe, expect, it } from "vitest";

import { runHtmlHealthCheck } from "@/lib/builder/html-health-check";
import { resolveBuilderQualityProfile } from "@/lib/builder/quality-profiles";

const HEALTHY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Healthy Page</title>
  <style>
    :root { --bg: #111; --accent: #39ff14; }
    body { margin: 0; background: linear-gradient(180deg, #111, #222); box-shadow: inset 0 0 0 1px #333; }
    button:focus-visible { outline: 2px solid #fff; }
    @media (max-width: 768px) { body { padding: 1rem; } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  </style>
</head>
<body>
  <button type="button">Start</button>
</body>
</html>`;

function hasFinding(result: ReturnType<typeof runHtmlHealthCheck>, id: string): boolean {
  return result.findings.some((finding) => finding.id === id);
}

describe("html health check", () => {
  it("scores valid complete HTML highly", () => {
    const result = runHtmlHealthCheck(HEALTHY_HTML);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.criticalCount).toBe(0);
    expect(result.chips.viewport).toBe(true);
    expect(result.chips.cssVariables).toBe(true);
    expect(result.chips.mediaQueries).toBe(true);
  });

  it("flags markdown fences as critical", () => {
    const result = runHtmlHealthCheck("```html\n<div>oops</div>\n```");
    expect(hasFinding(result, "markdownFences")).toBe(true);
    expect(result.findings.find((f) => f.id === "markdownFences")?.severity).toBe("critical");
  });

  it("warns when viewport meta is missing", () => {
    const html = HEALTHY_HTML.replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "",
    );
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "missingViewport")).toBe(true);
    expect(result.findings.find((f) => f.id === "missingViewport")?.severity).toBe("warning");
  });

  it("flags external scripts as critical", () => {
    const html = HEALTHY_HTML.replace(
      "</body>",
      '<script src="https://evil.example/payload.js"></script></body>',
    );
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "externalScript")).toBe(true);
    expect(result.chips.externalScripts).toBe(true);
  });

  it("flags eval as critical", () => {
    const html = HEALTHY_HTML.replace("</body>", "<script>eval('alert(1)')</script></body>");
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "evalUsage")).toBe(true);
  });

  it("warns when animation exists without reduced-motion support", () => {
    const html = `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Motion</title>
      <style>@keyframes spin { to { transform: rotate(360deg); } } .x { animation: spin 2s infinite; }</style>
      </head><body><div class="x">Spin</div></body></html>`;
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "animationWithoutReducedMotion")).toBe(true);
  });

  it("warns when querySelector target is missing", () => {
    const html = HEALTHY_HTML.replace(
      "</body>",
      "<script>document.querySelector('#missing-target').textContent = 'x';</script></body>",
    );
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "selectorNoMatch")).toBe(true);
  });

  it("warns when parallax offsets lack positioning", () => {
    const html = `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Parallax</title>
      <style>.float { top: 20px; left: 10px; }</style>
      </head><body><div class="float parallax">Float</div></body></html>`;
    const result = runHtmlHealthCheck(html, { userPrompt: "Build a parallax landing" });
    expect(hasFinding(result, "parallaxTopLeftNoPosition")).toBe(true);
  });

  it("warns when transform-style is used without perspective", () => {
    const html = `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>3D</title>
      <style>.scene { transform-style: preserve-3d; }</style>
      </head><body><div class="scene 3d">Depth</div></body></html>`;
    const result = runHtmlHealthCheck(html, { userPrompt: "Build a 3d card" });
    expect(hasFinding(result, "transformStyleNoPerspective")).toBe(true);
  });

  it("warns for empty buttons", () => {
    const html = HEALTHY_HTML.replace(
      '<button type="button">Start</button>',
      '<button type="button"></button>',
    );
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "emptyButton")).toBe(true);
  });

  it("warns when images lack alt text", () => {
    const html = HEALTHY_HTML.replace("</body>", '<img src="data:image/png;base64,abc" /></body>');
    const result = runHtmlHealthCheck(html);
    expect(hasFinding(result, "imageMissingAlt")).toBe(true);
  });

  it("warns when profile minimum score is not met", () => {
    const thinHtml = `<!DOCTYPE html><html><body><button></button></body></html>`;
    const profile = resolveBuilderQualityProfile("premium-saas", "saas landing");
    const result = runHtmlHealthCheck(thinHtml, { qualityProfile: profile });

    expect(hasFinding(result, "profile.minimumScoreNotMet")).toBe(true);
    expect(result.profile?.minimumScore).toBe(85);
    expect(result.profile?.id).toBe("premium-saas");
  });

  it("warns when profile expects reduced motion support", () => {
    const html = `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Motion</title>
      <style>@keyframes spin { to { transform: rotate(360deg); } } .x { animation: spin 2s infinite; }</style>
      </head><body><div class="x">Spin</div></body></html>`;
    const profile = resolveBuilderQualityProfile("neon-parallax", "neon parallax");
    const result = runHtmlHealthCheck(html, { qualityProfile: profile });

    expect(hasFinding(result, "profile.reducedMotionExpected")).toBe(true);
  });

  it("clamps score between 0 and 100", () => {
    const catastrophic = [
      "eval('x')",
      "new Function('x')",
      "document.write('x')",
      "javascript:alert(1)",
      '<script src="https://a.test/1.js"></script>',
      '<script src="https://b.test/2.js"></script>',
      '<iframe src="https://c.test"></iframe>',
      "```html",
    ].join("\n");

    const low = runHtmlHealthCheck(catastrophic);
    expect(low.score).toBe(0);

    const high = runHtmlHealthCheck(HEALTHY_HTML);
    expect(high.score).toBeLessThanOrEqual(100);
  });
});
