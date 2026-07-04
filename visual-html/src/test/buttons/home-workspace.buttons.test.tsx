import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ModeTabs, TopCreditBar } from "@/components/pngto/home-workspace";
import type { InputMode } from "@/lib/input-mode";
import { renderWithProviders } from "@/test/test-utils";

const TAB_LABELS: Record<InputMode, RegExp> = {
  upload: /Upload/i,
  url: /URL/i,
  text: /Text/i,
  import: /Import/i,
};

describe("buttons › home-workspace", () => {
  it("Upload tab — active and enabled", () => {
    renderWithProviders(<ModeTabs value="upload" onChange={vi.fn()} />);
    const upload = screen.getByRole("tab", { name: TAB_LABELS.upload });
    expect(upload).toBeEnabled();
    expect(upload).toHaveAttribute("aria-current", "page");
  });

  it.each(["url", "text", "import"] as const)("%s tab — enabled and switches mode", async (mode) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<ModeTabs value="upload" onChange={onChange} />);

    const tab = screen.getByRole("tab", { name: TAB_LABELS[mode] });
    expect(tab).toBeEnabled();
    await user.click(tab);
    expect(onChange).toHaveBeenCalledWith(mode);
  });

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