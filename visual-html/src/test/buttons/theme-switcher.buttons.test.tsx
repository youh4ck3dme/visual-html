import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ThemeSwitcher } from "@/components/pngto/theme-switcher";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › theme-switcher", () => {
  it("Light — sets pngto-theme light", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);
    await user.click(screen.getByLabelText("Light"));
    expect(localStorage.getItem("pngto-theme")).toBe("light");
  });

  it("Dark — sets pngto-theme dark", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);
    await user.click(screen.getByLabelText("Dark"));
    expect(localStorage.getItem("pngto-theme")).toBe("dark");
  });

  it("System — sets pngto-theme system", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);
    await user.click(screen.getByLabelText(/System/));
    expect(localStorage.getItem("pngto-theme")).toBe("system");
  });

  it("Compact cycle — click advances theme", async () => {
    const user = userEvent.setup();
    localStorage.setItem("pngto-theme", "light");
    renderWithProviders(<ThemeSwitcher compact />);
    await user.click(screen.getByLabelText(/Theme:/));
    expect(localStorage.getItem("pngto-theme")).toBe("dark");
  });
});