import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { APP_ICON } from "@/lib/app-brand";

import {
  isSquarePng,
  publicPath,
  readPngDimensions,
  readPublicFile,
  readPublicText,
} from "./helpers";

const REQUIRED_PUBLIC_FILES = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "icon.png",
  "site.webmanifest",
  "vibecraft-circuit.svg",
] as const;

const PNG_SPECS = [
  { file: "favicon-16x16.png", width: 16, height: 16 },
  { file: "favicon-32x32.png", width: 32, height: 32 },
  { file: "apple-touch-icon.png", width: 180, height: 180 },
  { file: "android-chrome-192x192.png", width: 192, height: 192 },
  { file: "android-chrome-512x512.png", width: 512, height: 512 },
  { file: "icon.png", width: 512, height: 512 },
] as const;

describe("PWA public assets", () => {
  describe("file presence", () => {
    it.each(REQUIRED_PUBLIC_FILES)("%s exists in public/", (file) => {
      expect(existsSync(publicPath(file))).toBe(true);
    });
  });

  describe("PNG dimensions", () => {
    it.each(PNG_SPECS)("%s is %ix%i", ({ file, width, height }) => {
      const dims = readPngDimensions(readPublicFile(file));
      expect(dims).toEqual({ width, height });
    });

    it.each(PNG_SPECS.map((s) => s.file))("%s is square", (file) => {
      expect(isSquarePng(file)).toBe(true);
    });
  });

  describe("favicon.ico", () => {
    it("is non-empty", () => {
      expect(readPublicFile("favicon.ico").length).toBeGreaterThan(1000);
    });
  });

  describe("icon.png mirrors android-chrome-512", () => {
    it("has identical byte size to 512 asset", () => {
      const icon = readPublicFile("icon.png");
      const chrome512 = readPublicFile("android-chrome-512x512.png");
      expect(icon.length).toBe(chrome512.length);
    });
  });

  describe("vibecraft-circuit.svg", () => {
    it("is valid SVG", () => {
      const svg = readPublicText("vibecraft-circuit.svg");
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    });

    it("contains PCB trace elements", () => {
      const svg = readPublicText("vibecraft-circuit.svg");
      expect(svg).toContain("<line");
      expect(svg).toContain("<circle");
      expect(svg).toContain("<rect");
    });

    it("uses gold circuit palette", () => {
      const svg = readPublicText("vibecraft-circuit.svg");
      expect(svg).toMatch(/#B8954A|#C9A962/);
    });
  });

  describe("APP_ICON paths resolve to existing files", () => {
    it.each(Object.entries(APP_ICON))("%s maps to public file", (_key, webPath) => {
      const file = webPath.replace(/^\//, "");
      expect(existsSync(publicPath(file))).toBe(true);
    });
  });
});
