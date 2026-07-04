import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { CodeBlock } from "@/components/pngto/code-block";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › code-block", () => {
  it("Copy code — writes to clipboard and shows Copied", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderWithProviders(<CodeBlock code="<div>test</div>" language="html" />);
    await user.click(screen.getByLabelText("Copy code"));
    expect(writeText).toHaveBeenCalledWith("<div>test</div>");
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("Copy code — shows toast when clipboard fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    renderWithProviders(<CodeBlock code="<div>test</div>" language="html" />);
    await user.click(screen.getByLabelText("Copy code"));
    await waitFor(() =>
      expect(screen.getByText(/Could not copy to clipboard/i)).toBeInTheDocument(),
    );
  });
});
