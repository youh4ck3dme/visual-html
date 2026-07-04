import { describe, expect, it } from "vitest";

import {
  buildForensicOptions,
  buildStructuralWarnings,
  estimateTokenBudget,
  fidelityInstruction,
  FORENSIC_PRESETS,
  inferZonesFromDensity,
  regionFocusInstruction,
} from "@/lib/image-forensics";

describe("image-forensics", () => {
  it("estimates higher token budget for larger images", () => {
    const small = estimateTokenBudget(400_000, 1200, 800);
    const large = estimateTokenBudget(1_100_000, 2400, 1600);
    expect(large.min).toBeGreaterThan(small.min);
    expect(large.max).toBeGreaterThan(small.max);
  });

  it("flags heavy files in structural warnings", () => {
    const warnings = buildStructuralWarnings(2_000_000, 2000, 3000, 200);
    expect(warnings.some((w) => w.id === "heavy-file")).toBe(true);
  });

  it("infers header and content zones from dense top band", () => {
    const density = Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) =>
        row < 2 ? 0.9 : row < 6 && col > 1 && col < 6 ? 0.5 : 0.1,
      ),
    );
    const zones = inferZonesFromDensity(density);
    expect(zones.some((z) => z.type === "header")).toBe(true);
    expect(zones.some((z) => z.type === "content")).toBe(true);
  });

  it("builds region-focused instructions", () => {
    const zone = inferZonesFromDensity(Array.from({ length: 8 }, () => Array(8).fill(0.5)))[0];
    const text = regionFocusInstruction(zone, 90);
    expect(text).toContain(zone.label);
    expect(text).toContain("Maximum pixel-perfect");
  });

  it("merges preset and fidelity into generation options", () => {
    const base = {
      outputMode: "static" as const,
      stylingMode: "vanilla-css" as const,
      responsiveness: "adaptive" as const,
      accessibilityLevel: "strict" as const,
    };
    const next = buildForensicOptions(base, 70, null, {
      id: "invoice",
      label: "Invoice",
      icon: "🧾",
      patch: { additionalInstructions: "Invoice mode." },
      focusHint: "invoice",
    });
    expect(next.additionalInstructions).toContain("Invoice mode.");
    expect(next.additionalInstructions).toContain(fidelityInstruction(70));
  });

  it("wordpress preset injects landing layout regions and mobile-first options", () => {
    const wordpress = FORENSIC_PRESETS.find((p) => p.id === "wordpress");
    expect(wordpress).toBeDefined();

    const base = {
      outputMode: "tailwind" as const,
      stylingMode: "tailwind" as const,
      responsiveness: "desktop-first" as const,
      accessibilityLevel: "standard" as const,
    };
    const next = buildForensicOptions(base, 82, null, wordpress!);

    expect(next.outputMode).toBe("static");
    expect(next.stylingMode).toBe("vanilla-css");
    expect(next.responsiveness).toBe("mobile-first");
    expect(next.accessibilityLevel).toBe("strict");
    expect(next.additionalInstructions).toContain("site-header");
    expect(next.additionalInstructions).toContain("site-hero");
    expect(next.additionalInstructions).toContain("site-main");
    expect(next.additionalInstructions).toContain("site-footer");
    expect(next.additionalInstructions).toContain(fidelityInstruction(82));
  });
});
