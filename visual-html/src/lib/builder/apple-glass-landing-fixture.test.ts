import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { runHtmlHealthCheck } from "@/lib/builder/html-health-check";
import { resolveBuilderQualityProfile } from "@/lib/builder/quality-profiles";

const html = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "apple-glass-landing-fixture.html"),
  "utf8",
);

describe("apple-glass landing fixture", () => {
  it("passes Apple Glass quality profile", () => {
    const profile = resolveBuilderQualityProfile("apple-glass", "apple glass landing");
    const result = runHtmlHealthCheck(html, {
      qualityProfile: profile,
      userPrompt: "apple glass premium landing",
    });

    expect(result.score).toBeGreaterThanOrEqual(88);
    expect(result.warningCount).toBe(0);
    expect(result.criticalCount).toBe(0);
    expect(result.chips.reducedMotion).toBe(true);
    expect(result.chips.mediaQueries).toBe(true);
    expect(result.chips.viewport).toBe(true);
    expect(result.chips.cssVariables).toBe(true);
  });
});
