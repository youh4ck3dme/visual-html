import { describe, expect, it } from "vitest";

import { APP_THEME_COLOR } from "@/lib/app-brand";

import { readPublicText } from "./helpers";

type WebManifest = {
  id?: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  orientation?: string;
  lang?: string;
  theme_color: string;
  background_color: string;
  categories?: string[];
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
};

function loadManifest(): WebManifest {
  return JSON.parse(readPublicText("site.webmanifest")) as WebManifest;
}

describe("site.webmanifest", () => {
  const manifest = loadManifest();

  it("parses as valid JSON", () => {
    expect(manifest.name).toBeTruthy();
  });

  it.each([
    ["name", "PNGtoHTMLapp"],
    ["short_name", "PNGtoHTML"],
    ["start_url", "/"],
    ["scope", "/"],
    ["display", "standalone"],
    ["orientation", "any"],
    ["lang", "en"],
    ["theme_color", APP_THEME_COLOR],
    ["background_color", APP_THEME_COLOR],
    ["id", "/"],
  ] as const)("%s is %s", (key, value) => {
    expect(manifest[key]).toBe(value);
  });

  it("description mentions VibeCraft", () => {
    expect(manifest.description.toLowerCase()).toContain("vibecraft");
  });

  it("includes productivity category", () => {
    expect(manifest.categories).toContain("productivity");
  });

  describe("icons", () => {
    it("defines at least 4 icon entries", () => {
      expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    });

    it.each(manifest.icons.map((icon, i) => [i, icon] as const))(
      "icon[%i] has src, sizes, type",
      (_i, icon) => {
        expect(icon.src).toMatch(/^\//);
        expect(icon.sizes).toMatch(/^\d+x\d+$/);
        expect(icon.type).toBe("image/png");
      },
    );

    it("includes 192x192 any purpose", () => {
      const icon = manifest.icons.find((i) => i.sizes === "192x192" && i.purpose === "any");
      expect(icon?.src).toBe("/android-chrome-192x192.png");
    });

    it("includes 512x512 any purpose", () => {
      const icon = manifest.icons.find((i) => i.sizes === "512x512" && i.purpose === "any");
      expect(icon?.src).toBe("/android-chrome-512x512.png");
    });

    it("includes 192x192 maskable for Android adaptive icons", () => {
      const icon = manifest.icons.find((i) => i.sizes === "192x192" && i.purpose === "maskable");
      expect(icon).toBeDefined();
    });

    it("includes 512x512 maskable for splash / install UI", () => {
      const icon = manifest.icons.find((i) => i.sizes === "512x512" && i.purpose === "maskable");
      expect(icon).toBeDefined();
    });
  });
});
