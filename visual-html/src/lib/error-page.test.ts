import { describe, expect, it } from "vitest";

import { APP_THEME_COLOR } from "./app-brand";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  const html = renderErrorPage();

  it("includes Try again button with reload handler", () => {
    expect(html).toContain('onclick="location.reload()"');
    expect(html).toContain("Try again");
  });

  it("includes Go home link to /", () => {
    expect(html).toContain('href="/"');
    expect(html).toContain("Go home");
  });

  it("embeds theme-color meta", () => {
    expect(html).toContain(`content="${APP_THEME_COLOR}"`);
    expect(html).toContain('name="theme-color"');
  });

  it("is a complete HTML document", () => {
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain("</html>");
  });
});
