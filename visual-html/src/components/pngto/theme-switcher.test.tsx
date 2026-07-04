import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { LocaleProvider } from "@/hooks/use-locale";
import { ThemeProvider } from "@/hooks/use-theme";
import { messages } from "@/lib/i18n/messages";
import { ThemeSwitcher } from "./theme-switcher";

function wrap(ui: React.ReactNode) {
  return (
    <LocaleProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </LocaleProvider>
  );
}

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
    localStorage.setItem("pngto-locale", "en");
  });

  it("renders segmented control with three theme options", () => {
    const html = renderToStaticMarkup(wrap(<ThemeSwitcher />));

    expect(html).toContain(`aria-label="${messages.en["theme.groupAria"]}"`);
    expect(html).toContain(`aria-label="${messages.en["theme.light"]}"`);
    expect(html).toContain(`aria-label="${messages.en["theme.dark"]}"`);
    expect(html).toContain(messages.en["theme.system"]);
  });

  it("renders compact cycle button with accessible label", () => {
    const html = renderToStaticMarkup(wrap(<ThemeSwitcher compact />));

    expect(html).toContain("Theme:");
    expect(html).not.toContain(`aria-label="${messages.en["theme.groupAria"]}"`);
  });
});
