import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";

import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › sidebar-nav", () => {
  it("PNGtoHTML home (desktop) — link exists and points to /", () => {
    renderWithProviders(<VisualSidebar />);
    const desktop = screen.getByLabelText("Application navigation");
    const home = within(desktop).getAllByLabelText("PNGtoHTML home")[0];
    expect(home).toHaveAttribute("href", "/");
  });

  it("PNGtoHTML home (mobile) — link exists and points to /", () => {
    renderWithProviders(<VisualSidebar />);
    const mobile = screen.getByLabelText("Mobile navigation");
    const home = within(mobile).getByLabelText("PNGtoHTML home");
    expect(home).toHaveAttribute("href", "/");
  });

  it.each([
    ["Projects", "/projects"],
    ["New", "/"],
    ["VibeCraft", "/builder"],
  ] as const)("nav %s — link points to %s", (label, href) => {
    renderWithProviders(<VisualSidebar />);
    const links = screen.getAllByLabelText(label);
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link).toHaveAttribute("href", href);
    }
  });

  it.each(["Support", "Settings", "Account"] as const)(
    "%s — disabled (intentional placeholder)",
    (label) => {
      renderWithProviders(<VisualSidebar />);
      const btn = screen.getByLabelText(label);
      expect(btn).toBeDisabled();
    },
  );

  it("Theme (compact sidebar) — click cycles theme", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VisualSidebar />);
    const desktop = screen.getByLabelText("Application navigation");
    const themeBtn = within(desktop).getByLabelText(/Theme:/);
    const before = localStorage.getItem("pngto-theme");
    await user.click(themeBtn);
    const after = localStorage.getItem("pngto-theme");
    expect(after).not.toBe(before);
  });
});
