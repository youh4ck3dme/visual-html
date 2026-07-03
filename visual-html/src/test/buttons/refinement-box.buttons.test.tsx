import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { RefinementBox } from "@/components/pngto/refinement-box";
import { renderWithProviders } from "@/test/test-utils";

const QUICK_LABELS = [
  "Improve fidelity",
  "Make responsive",
  "Improve semantics",
  "Simplify wrappers",
  "Convert to Tailwind",
  "Optimize SEO",
] as const;

describe("buttons › refinement-box", () => {
  it.each(QUICK_LABELS)('quick chip "%s" — submits instruction', async (label) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<RefinementBox onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: label }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0]).toBeTruthy();
  });

  it("Refine — disabled when textarea empty", () => {
    renderWithProviders(<RefinementBox onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Refine/i })).toBeDisabled();
  });

  it("Refine — submits custom instruction", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<RefinementBox onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Refinement instruction"), "Add dark mode");
    await user.click(screen.getByRole("button", { name: /Refine/i }));
    expect(onSubmit).toHaveBeenCalledWith("Add dark mode");
  });

  it.each(QUICK_LABELS)('quick chip "%s" — disabled when busy', (label) => {
    renderWithProviders(<RefinementBox onSubmit={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: label })).toBeDisabled();
  });
});
