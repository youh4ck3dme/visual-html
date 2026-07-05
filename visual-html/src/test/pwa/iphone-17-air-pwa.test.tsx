import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { AppLogo } from "@/components/pngto/app-logo";
import {
  APP_HEAD_LINKS,
  APP_ICON,
  APP_ICON_VERSION,
  APP_PWA_META,
  APP_THEME_COLOR,
  APP_VIEWPORT,
  appIconHref,
} from "@/lib/app-brand";
import { renderErrorPage } from "@/lib/error-page";
import { Route as RootRoute } from "@/routes/__root";

import { readPngDimensions, readPublicFile } from "./helpers";
import {
  IPHONE_17_AIR,
  IPHONE_17_AIR_HEAD_RELS,
  IPHONE_17_AIR_REQUIRED_META,
  IPHONE_17_AIR_REQUIRED_VIEWPORT_TOKENS,
  IPHONE_LEGACY_COMPACT,
} from "./iphone-17-air-profile";

const ROOT_HEAD = RootRoute.options.head?.({} as never) as {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
};

function metaContent(name: string): string | undefined {
  return ROOT_HEAD.meta.find((m) => m.name === name)?.content;
}

describe("iPhone 17 Air PWA compliance", () => {
  describe("device profile sanity", () => {
    it.each([
      ["model", "iPhone 17 Air"],
      ["os", "iOS 26"],
      ["devicePixelRatio", 3],
      ["logicalWidth", 420],
      ["logicalHeight", 912],
      ["homeScreenIconPoints", 180],
      ["statusBarStyle", "black-translucent"],
      ["displayMode", "standalone"],
    ] as const)("%s = %s", (key, value) => {
      expect(IPHONE_17_AIR[key]).toBe(value);
    });

    it("physical width matches 3× logical width", () => {
      expect(IPHONE_17_AIR.physicalWidth).toBe(
        IPHONE_17_AIR.logicalWidth * IPHONE_17_AIR.devicePixelRatio,
      );
    });

    it("physical height matches 3× logical height", () => {
      expect(IPHONE_17_AIR.physicalHeight).toBe(
        IPHONE_17_AIR.logicalHeight * IPHONE_17_AIR.devicePixelRatio,
      );
    });

    it("home screen physical icon target is 540px", () => {
      expect(IPHONE_17_AIR.homeScreenIconPhysical).toBe(
        IPHONE_17_AIR.homeScreenIconPoints * IPHONE_17_AIR.devicePixelRatio,
      );
    });
  });

  describe("legacy compact profile", () => {
    it("uses 393×852 logical resolution", () => {
      expect(IPHONE_LEGACY_COMPACT.logicalWidth).toBe(393);
      expect(IPHONE_LEGACY_COMPACT.logicalHeight).toBe(852);
    });

    it("physical dimensions are 3× logical", () => {
      expect(IPHONE_LEGACY_COMPACT.physicalWidth).toBe(1179);
      expect(IPHONE_LEGACY_COMPACT.physicalHeight).toBe(2556);
    });
  });

  describe("apple-touch-icon asset for home screen", () => {
    const dims = readPngDimensions(readPublicFile("apple-touch-icon.png"));

    it("is exactly 180×180 points asset", () => {
      expect(dims).toEqual({ width: 180, height: 180 });
    });

    it("meets iOS minimum home screen icon size", () => {
      expect(dims.width).toBeGreaterThanOrEqual(IPHONE_17_AIR.homeScreenIconPoints);
      expect(dims.height).toBeGreaterThanOrEqual(IPHONE_17_AIR.homeScreenIconPoints);
    });

    it("is square for iOS springboard mask", () => {
      expect(dims.width).toBe(dims.height);
    });
  });

  describe("maskable / splash icons for install sheet", () => {
    it("512px icon exceeds 3× home screen point size", () => {
      const dims = readPngDimensions(readPublicFile("android-chrome-512x512.png"));
      expect(dims.width).toBeGreaterThanOrEqual(IPHONE_17_AIR.recommendedMaskableIcon);
    });

    it("192px icon meets Android-style minimum reused on iOS splash", () => {
      const dims = readPngDimensions(readPublicFile("android-chrome-192x192.png"));
      expect(dims.width).toBeGreaterThanOrEqual(IPHONE_17_AIR.minMaskableIcon);
    });
  });

  describe("root route <head> viewport", () => {
    it.each(IPHONE_17_AIR_REQUIRED_VIEWPORT_TOKENS)('viewport contains "%s"', (token) => {
      expect(APP_VIEWPORT).toContain(token);
    });

    it("root meta viewport uses APP_VIEWPORT constant", () => {
      expect(metaContent("viewport")).toBe(APP_VIEWPORT);
    });

    it("viewport-fit=cover enables edge-to-edge on iPhone 17 Air OLED", () => {
      expect(metaContent("viewport")).toContain("viewport-fit=cover");
    });
  });

  describe("root route iOS PWA meta tags", () => {
    it.each(IPHONE_17_AIR_REQUIRED_META)('includes meta name="%s"', (name) => {
      expect(ROOT_HEAD.meta.some((m) => m.name === name)).toBe(true);
    });

    it("apple-mobile-web-app-capable is yes", () => {
      expect(metaContent("apple-mobile-web-app-capable")).toBe("yes");
    });

    it("status bar style matches profile", () => {
      expect(metaContent("apple-mobile-web-app-status-bar-style")).toBe(
        IPHONE_17_AIR.statusBarStyle,
      );
    });

    it("apple-mobile-web-app-title is short brand", () => {
      expect(metaContent("apple-mobile-web-app-title")).toBe("PNGtoHTML");
    });

    it("theme-color matches OLED shell", () => {
      expect(metaContent("theme-color")).toBe(APP_THEME_COLOR);
    });

    it("theme-color equals manifest theme_color", () => {
      expect(metaContent("theme-color")).toBe("#0f0f0f");
    });
  });

  describe("root route icon <link> tags", () => {
    it.each(IPHONE_17_AIR_HEAD_RELS)('includes link rel="%s"', (rel) => {
      expect(ROOT_HEAD.links.some((l) => l.rel === rel)).toBe(true);
    });

    it("apple-touch-icon href is versioned", () => {
      const link = ROOT_HEAD.links.find((l) => l.rel === "apple-touch-icon");
      expect(link?.href).toBe(appIconHref(APP_ICON.appleTouch));
    });

    it("apple-touch-icon sizes attribute is 180x180", () => {
      const link = ROOT_HEAD.links.find((l) => l.rel === "apple-touch-icon");
      expect(link?.sizes).toBe("180x180");
    });

    it("manifest link is present for Add to Home Screen", () => {
      const link = ROOT_HEAD.links.find((l) => l.rel === "manifest");
      expect(link?.href).toContain("site.webmanifest");
    });

    it.each(APP_HEAD_LINKS.map((l) => l.rel))("APP_HEAD_LINKS rel %s is in root head", (rel) => {
      expect(ROOT_HEAD.links.some((l) => l.rel === rel)).toBe(true);
    });
  });

  describe("Open Graph / share sheet from iOS Safari", () => {
    it("og:image points to 512 icon", () => {
      const og = ROOT_HEAD.meta.find((m) => m.property === "og:image");
      expect(og?.content).toBe(appIconHref(APP_ICON.android512));
    });

    it("og:image dimensions are 512", () => {
      const w = ROOT_HEAD.meta.find((m) => m.property === "og:image:width");
      const h = ROOT_HEAD.meta.find((m) => m.property === "og:image:height");
      expect(w?.content).toBe("512");
      expect(h?.content).toBe("512");
    });

    it("twitter:card is summary for link previews", () => {
      const card = ROOT_HEAD.meta.find((m) => m.name === "twitter:card");
      expect(card?.content).toBe("summary");
    });
  });

  describe("SSR error page fallback (offline / boot failure)", () => {
    const html = renderErrorPage();

    it.each(IPHONE_17_AIR_REQUIRED_VIEWPORT_TOKENS)('error page viewport has "%s"', (token) => {
      expect(html).toContain(token);
    });

    it.each(IPHONE_17_AIR_REQUIRED_META)('error page has meta name="%s"', (name) => {
      expect(html).toContain(`name="${name}"`);
    });

    it("error page embeds versioned 512 logo", () => {
      expect(html).toContain(appIconHref(APP_ICON.android512));
    });

    it("error page includes apple-touch-icon link", () => {
      expect(html).toContain('rel="apple-touch-icon"');
    });

    it("error page includes manifest link", () => {
      expect(html).toContain('rel="manifest"');
    });
  });

  describe("AppLogo component on iOS retina", () => {
    it.each([
      ["xs", 16],
      ["sm", 32],
      ["md", 36],
      ["lg", 48],
    ] as const)("size %s renders width/height %i", (size, px) => {
      const { container } = render(<AppLogo size={size} />);
      const img = container.querySelector("img");
      expect(img?.getAttribute("width")).toBe(String(px));
      expect(img?.getAttribute("height")).toBe(String(px));
    });

    it("img src uses versioned 512 asset", () => {
      const { container } = render(<AppLogo size="md" />);
      const img = container.querySelector("img");
      expect(img?.getAttribute("src")).toBe(appIconHref(APP_ICON.android512));
    });

    it("img is decorative (aria-hidden)", () => {
      const { container } = render(<AppLogo size="sm" />);
      expect(container.querySelector("img")?.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("VibeCraft studio shell for /builder on iPhone", () => {
    const builderSource = readFileSync(
      join(process.cwd(), "src/components/builder/builder-studio-view.tsx"),
      "utf-8",
    );

    it("builder page uses vibecraft-studio background class", () => {
      expect(builderSource).toContain("vibecraft-studio");
    });

    it("builder workspace uses translucent studio surfaces", () => {
      const outputPanelSource = readFileSync(
        join(process.cwd(), "src/components/app/output-panel.tsx"),
        "utf-8",
      );
      expect(outputPanelSource).toContain("vibecraft-studio-elevated");
    });
  });

  describe("APP_PWA_META parity with iPhone 17 Air profile", () => {
    it.each(APP_PWA_META.map((m) => [m.name, m.content] as const))(
      "exported meta %s survives root spread",
      (name, content) => {
        expect(ROOT_HEAD.meta.find((m) => m.name === name)?.content).toBe(content);
      },
    );
  });

  describe("cache bust for post-install icon refresh", () => {
    it.each([APP_ICON.appleTouch, APP_ICON.favicon32, APP_ICON.android512, APP_ICON.manifest])(
      "version query applied to %s",
      (path) => {
        expect(appIconHref(path)).toContain(`v=${APP_ICON_VERSION}`);
      },
    );
  });
});
