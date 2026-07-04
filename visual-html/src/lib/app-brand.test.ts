import { describe, expect, it } from "vitest";

import {
  APP_HEAD_LINKS,
  APP_ICON,
  APP_ICON_VERSION,
  APP_PWA_META,
  APP_THEME_COLOR,
  APP_VIEWPORT,
  appHeadLinkTags,
  appIconHref,
} from "./app-brand";

describe("app-brand", () => {
  describe("appIconHref", () => {
    it("appends cache-bust version query", () => {
      expect(appIconHref("/favicon.ico")).toBe(`/favicon.ico?v=${APP_ICON_VERSION}`);
    });

    it("preserves existing path segments", () => {
      expect(appIconHref(APP_ICON.android512)).toContain("/android-chrome-512x512.png");
    });

    it("uses current APP_ICON_VERSION constant", () => {
      expect(appIconHref("/x.png")).toMatch(/\?v=\d+$/);
    });
  });

  describe("APP_ICON paths", () => {
    it.each([
      ["faviconIco", "/favicon.ico"],
      ["favicon16", "/favicon-16x16.png"],
      ["favicon32", "/favicon-32x32.png"],
      ["appleTouch", "/apple-touch-icon.png"],
      ["android192", "/android-chrome-192x192.png"],
      ["android512", "/android-chrome-512x512.png"],
      ["manifest", "/site.webmanifest"],
      ["electron", "/icon.png"],
      ["circuitPattern", "/vibecraft-circuit.svg"],
    ] as const)("APP_ICON.%s points to %s", (key, path) => {
      expect(APP_ICON[key]).toBe(path);
    });
  });

  describe("APP_VIEWPORT", () => {
    it("includes device-width", () => {
      expect(APP_VIEWPORT).toContain("width=device-width");
    });

    it("includes viewport-fit=cover for edge-to-edge iOS", () => {
      expect(APP_VIEWPORT).toContain("viewport-fit=cover");
    });

    it("includes interactive-widget for iOS keyboard", () => {
      expect(APP_VIEWPORT).toContain("interactive-widget=resizes-content");
    });
  });

  describe("APP_THEME_COLOR", () => {
    it("matches manifest dark shell", () => {
      expect(APP_THEME_COLOR).toBe("#0f0f0f");
    });
  });

  describe("APP_HEAD_LINKS", () => {
    it("includes apple-touch-icon at 180x180", () => {
      const link = APP_HEAD_LINKS.find((l) => l.rel === "apple-touch-icon");
      expect(link?.sizes).toBe("180x180");
      expect(link?.href).toBe(appIconHref(APP_ICON.appleTouch));
    });

    it("includes precomposed apple touch icon", () => {
      const link = APP_HEAD_LINKS.find((l) => l.rel === "apple-touch-icon-precomposed");
      expect(link).toBeDefined();
      expect(link?.href).toBe(appIconHref(APP_ICON.appleTouch));
    });

    it("includes favicon PNG sizes 16 and 32", () => {
      const sizes = APP_HEAD_LINKS.filter((l) => l.rel === "icon" && "type" in l).map(
        (l) => l.sizes,
      );
      expect(sizes).toContain("16x16");
      expect(sizes).toContain("32x32");
    });

    it("includes favicon.ico fallback", () => {
      const ico = APP_HEAD_LINKS.find(
        (l): l is (typeof APP_HEAD_LINKS)[number] & { sizes: string } =>
          l.href.includes("favicon.ico") && "sizes" in l,
      );
      expect(ico?.sizes).toBe("any");
    });

    it("includes web manifest link", () => {
      const manifest = APP_HEAD_LINKS.find((l) => l.rel === "manifest");
      expect(manifest?.href).toBe(appIconHref(APP_ICON.manifest));
    });

    it.each(APP_HEAD_LINKS.map((l) => l.href))("head link href is versioned: %s", (href) => {
      expect(href).toContain(`?v=${APP_ICON_VERSION}`);
    });
  });

  describe("APP_PWA_META", () => {
    it.each([
      ["application-name", "PNGtoHTML"],
      ["mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-status-bar-style", "black-translucent"],
      ["msapplication-TileColor", "#0f0f0f"],
    ] as const)("meta %s = %s", (name, content) => {
      const meta = APP_PWA_META.find((m) => m.name === name);
      expect(meta?.content).toBe(content);
    });

    it("msapplication tile image uses 512 icon", () => {
      const tile = APP_PWA_META.find((m) => m.name === "msapplication-TileImage");
      expect(tile?.content).toBe(appIconHref(APP_ICON.android512));
    });
  });

  describe("appHeadLinkTags", () => {
    it("renders link tags for every head link", () => {
      const html = appHeadLinkTags();
      expect(html.match(/<link /g)?.length).toBe(APP_HEAD_LINKS.length);
    });

    it("includes apple-touch-icon rel", () => {
      expect(appHeadLinkTags()).toContain('rel="apple-touch-icon"');
    });

    it("includes manifest rel", () => {
      expect(appHeadLinkTags()).toContain('rel="manifest"');
    });
  });
});
