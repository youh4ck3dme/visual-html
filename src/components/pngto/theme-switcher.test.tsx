import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ThemeProvider } from "@/hooks/use-theme";
import { ThemeSwitcher } from "./theme-switcher";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("dark"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    localStorage.clear();
  });
  it("renders segmented control with three theme options", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );

    expect(html).toContain('aria-label="Color theme"');
    expect(html).toContain('aria-label="Light"');
    expect(html).toContain('aria-label="Dark"');
    expect(html).toContain('aria-label="System');
  });

  it("renders compact cycle button with accessible label", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <ThemeSwitcher compact />
      </ThemeProvider>,
    );

    expect(html).toContain("Theme:");
    expect(html).not.toContain('aria-label="Color theme"');
  });
});
