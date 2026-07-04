import { describe, expect, it } from "vitest";

import {
  STORAGE_KEY,
  applyThemeToDocument,
  compactSwitcherIcon,
  compactSwitcherLabel,
  nextThemeInCycle,
  parseStoredTheme,
  resolveTheme,
  themeColorMeta,
  themeInitScript,
} from "@/lib/theme";

describe("theme tokens", () => {
  it("parses valid stored themes and falls back to dark", () => {
    expect(parseStoredTheme("light")).toBe("light");
    expect(parseStoredTheme("dark")).toBe("dark");
    expect(parseStoredTheme("system")).toBe("system");
    expect(parseStoredTheme("invalid")).toBe("dark");
    expect(parseStoredTheme(null)).toBe("dark");
  });

  it("resolves explicit and system themes", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("maps meta theme-color per resolved theme", () => {
    expect(themeColorMeta("dark")).toBe("#000000");
    expect(themeColorMeta("light")).toBe("#f4f4f6");
  });

  it("cycles compact switcher light → dark → system → light", () => {
    expect(nextThemeInCycle("light")).toBe("dark");
    expect(nextThemeInCycle("dark")).toBe("system");
    expect(nextThemeInCycle("system")).toBe("light");
  });

  it("picks compact icon by selected mode", () => {
    expect(compactSwitcherIcon("light")).toBe("sun");
    expect(compactSwitcherIcon("dark")).toBe("moon");
    expect(compactSwitcherIcon("system")).toBe("monitor");
  });

  it("labels system mode with resolved theme", () => {
    expect(compactSwitcherLabel("system", "dark")).toBe("System (dark)");
    expect(compactSwitcherLabel("system", "light")).toBe("System (light)");
    expect(compactSwitcherLabel("dark", "dark")).toBe("Dark");
  });

  it("exports stable storage key in init script", () => {
    expect(STORAGE_KEY).toBe("pngto-theme");
    expect(themeInitScript).toContain(STORAGE_KEY);
    expect(themeInitScript).toContain("theme-color");
  });
});

describe("applyThemeToDocument", () => {
  it("toggles dark class and color-scheme without animation", () => {
    const doc = document.implementation.createHTMLDocument("theme-test");
    const meta = doc.createElement("meta");
    meta.setAttribute("name", "theme-color");
    doc.head.appendChild(meta);

    applyThemeToDocument(doc, "dark", { animate: false });
    expect(doc.documentElement.classList.contains("dark")).toBe(true);
    expect(doc.documentElement.style.colorScheme).toBe("dark");
    expect(meta.getAttribute("content")).toBe("#000000");

    applyThemeToDocument(doc, "light", { animate: false });
    expect(doc.documentElement.classList.contains("dark")).toBe(false);
    expect(doc.documentElement.style.colorScheme).toBe("light");
    expect(meta.getAttribute("content")).toBe("#f4f4f6");
  });

  it("adds theme-animate class as CSS fallback when view transitions are unavailable", () => {
    const doc = document.implementation.createHTMLDocument("theme-test");
    applyThemeToDocument(doc, "light", { animate: true });
    expect(doc.documentElement.classList.contains("theme-animate")).toBe(true);
  });
});
