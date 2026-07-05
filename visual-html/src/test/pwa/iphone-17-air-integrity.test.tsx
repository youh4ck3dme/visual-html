import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { APP_PWA_META, APP_THEME_COLOR } from "@/lib/app-brand";

import { APP_IPHONE_17_AIR_FIX_PROMPT } from "@/lib/prompts/app-iphone-fix-prompt";
import { IPHONE_AIR_HTML_FIX_PROMPT } from "@/lib/builder/quality-fix-prompts";
import { IPHONE_17_AIR, IPHONE_LEGACY_COMPACT } from "@/lib/iphone-viewport";
import { computeAppIphoneHealthScore } from "@/test/mobile/iphone-viewport.helpers";

describe("iPhone 17 Air integrity rubric", () => {
  const stylesSource = readFileSync(join(process.cwd(), "src/styles.css"), "utf-8");
  const layoutSource = readFileSync(
    join(process.cwd(), "src/components/editor/editor-layout.tsx"),
    "utf-8",
  );
  const headerSource = readFileSync(
    join(process.cwd(), "src/components/editor/editor-header.tsx"),
    "utf-8",
  );
  const promptSource = readFileSync(
    join(process.cwd(), "src/components/editor/editor-prompt-bar.tsx"),
    "utf-8",
  );

  describe("dual viewport constants", () => {
    it("iPhone 17 Air uses 420×912 logical resolution", () => {
      expect(IPHONE_17_AIR.logicalWidth).toBe(420);
      expect(IPHONE_17_AIR.logicalHeight).toBe(912);
      expect(IPHONE_17_AIR.physicalWidth).toBe(1260);
      expect(IPHONE_17_AIR.physicalHeight).toBe(2736);
    });

    it("legacy compact uses 393×852 logical resolution", () => {
      expect(IPHONE_LEGACY_COMPACT.logicalWidth).toBe(393);
      expect(IPHONE_LEGACY_COMPACT.logicalHeight).toBe(852);
    });

    it("both profiles share 3× DPR and safe-area insets", () => {
      expect(IPHONE_17_AIR.devicePixelRatio).toBe(3);
      expect(IPHONE_LEGACY_COMPACT.devicePixelRatio).toBe(3);
      expect(IPHONE_17_AIR.safeAreaTop).toBe(IPHONE_LEGACY_COMPACT.safeAreaTop);
      expect(IPHONE_17_AIR.safeAreaBottom).toBe(IPHONE_LEGACY_COMPACT.safeAreaBottom);
    });
  });

  describe("CSS safe-area tokens", () => {
    it("defines editor safe-area CSS variables", () => {
      expect(stylesSource).toContain("--editor-safe-top");
      expect(stylesSource).toContain("--editor-safe-bottom");
      expect(stylesSource).toContain("env(safe-area-inset-bottom");
    });

    it("editor layout prompt bar uses safe-area bottom", () => {
      expect(layoutSource).toContain("--editor-safe-bottom");
    });

    it("editor header uses safe-area top", () => {
      expect(headerSource).toContain("safe-area-inset-top");
    });
  });

  describe("touch target audit", () => {
    it("prompt bar submit uses min-h-11", () => {
      expect(promptSource).toContain("min-h-11");
    });

    it("editor nav tabs use min-h-11", () => {
      expect(headerSource).toContain("min-h-11");
    });

    it("settings button uses 44px tap target", () => {
      expect(headerSource).toContain("h-11 min-w-11");
    });
  });

  describe("fix prompts", () => {
    it("APP_IPHONE_17_AIR_FIX_PROMPT targets 420 and 393 viewports", () => {
      expect(APP_IPHONE_17_AIR_FIX_PROMPT).toContain("420×912");
      expect(APP_IPHONE_17_AIR_FIX_PROMPT).toContain("393×852");
      expect(APP_IPHONE_17_AIR_FIX_PROMPT).toContain("test:integrity:iphone-17-air");
    });

    it("IPHONE_AIR_HTML_FIX_PROMPT includes safe-area and 420px breakpoint", () => {
      expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("420×912");
      expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("393×852");
      expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("safe-area-inset-bottom");
      expect(IPHONE_AIR_HTML_FIX_PROMPT).toContain("max-width: 420px");
    });
  });

  describe("PWA manifest alignment", () => {
    const manifest = JSON.parse(
      readFileSync(join(process.cwd(), "public/site.webmanifest"), "utf-8"),
    ) as {
      theme_color: string;
      background_color: string;
      short_name: string;
    };

    it("manifest theme_color matches app-brand", () => {
      expect(manifest.theme_color).toBe(APP_THEME_COLOR);
      expect(manifest.background_color).toBe(APP_THEME_COLOR);
    });

    it("manifest short_name matches application-name meta", () => {
      const appName = APP_PWA_META.find((m) => m.name === "application-name");
      expect(appName?.content).toBe(manifest.short_name);
    });
  });

  describe("app iPhone health score helper", () => {
    it("returns 0 for empty checks", () => {
      expect(computeAppIphoneHealthScore([])).toBe(0);
    });

    it("returns partial score for mixed checks", () => {
      expect(computeAppIphoneHealthScore([true, false])).toBe(50);
    });
  });
});
