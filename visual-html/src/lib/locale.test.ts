import { describe, expect, it } from "vitest";

import { LOCALE_STORAGE_KEY, nextLocaleInCycle, parseStoredLocale } from "./locale";

describe("locale", () => {
  describe("parseStoredLocale", () => {
    it("returns en when storage is null", () => {
      expect(parseStoredLocale(null)).toBe("en");
    });

    it("returns sk when storage is sk", () => {
      expect(parseStoredLocale("sk")).toBe("sk");
    });

    it("returns en when storage is invalid", () => {
      expect(parseStoredLocale("de")).toBe("en");
    });

    it("respects custom fallback", () => {
      expect(parseStoredLocale("fr", "sk")).toBe("sk");
    });
  });

  describe("nextLocaleInCycle", () => {
    it("toggles en to sk", () => {
      expect(nextLocaleInCycle("en")).toBe("sk");
    });

    it("toggles sk to en", () => {
      expect(nextLocaleInCycle("sk")).toBe("en");
    });
  });

  it("LOCALE_STORAGE_KEY is pngto-locale", () => {
    expect(LOCALE_STORAGE_KEY).toBe("pngto-locale");
  });
});
