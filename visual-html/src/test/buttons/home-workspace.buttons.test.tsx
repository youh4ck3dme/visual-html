import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ModeTabs, TopCreditBar } from "@/components/pngto/home-workspace";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › home-workspace", () => {
  it("Upload tab — active and enabled", () => {
    renderWithProviders(<ModeTabs />);
    const upload = screen.getByRole("button", { name: /Upload/i });
    expect(upload).toBeEnabled();
    expect(upload).toHaveAttribute("aria-current", "page");
  });

  it.each(["URL", "Text", "Import"] as const)(
    "%s tab — disabled (not implemented yet)",
    (label) => {
      renderWithProviders(<ModeTabs />);
      expect(screen.getByRole("button", { name: label })).toBeDisabled();
    },
  );

  it("Theme Light — click sets light theme", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopCreditBar />);
    await user.click(screen.getByLabelText("Light"));
    expect(localStorage.getItem("pngto-theme")).toBe("light");
  });

  it("Theme Dark — click sets dark theme", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopCreditBar />);
    await user.click(screen.getByLabelText("Dark"));
    expect(localStorage.getItem("pngto-theme")).toBe("dark");
  });

  it("Theme System — click sets system theme", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopCreditBar />);
    await user.click(screen.getByLabelText(/System/));
    expect(localStorage.getItem("pngto-theme")).toBe("system");
  });
});