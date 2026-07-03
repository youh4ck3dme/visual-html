import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { GenerationOptionsPanel } from "@/components/pngto/generation-options";
import { renderWithProviders } from "@/test/test-utils";
import { SAMPLE_GENERATION_OPTIONS } from "@/test/mocks/sample-image";

describe("buttons › generation-options", () => {
  it("Output mode select — opens and changes value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <GenerationOptionsPanel value={SAMPLE_GENERATION_OPTIONS} onChange={onChange} />,
    );
    await user.click(screen.getByLabelText("Output"));
    await user.click(screen.getByRole("option", { name: /Tailwind/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ outputMode: "tailwind" }),
    );
  });

  it("Styling select — opens and changes value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <GenerationOptionsPanel value={SAMPLE_GENERATION_OPTIONS} onChange={onChange} />,
    );
    await user.click(screen.getByLabelText("Styling"));
    await user.click(screen.getByRole("option", { name: /Inline styles/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ stylingMode: "inline-css" }),
    );
  });

  it("Responsiveness select — disabled when panel disabled", () => {
    renderWithProviders(
      <GenerationOptionsPanel
        value={SAMPLE_GENERATION_OPTIONS}
        onChange={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByLabelText("Responsiveness")).toBeDisabled();
  });
});