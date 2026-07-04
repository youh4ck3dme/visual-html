import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ImageLightbox } from "@/components/pngto/image-lightbox";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › image-lightbox", () => {
  it("Close — calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <ImageLightbox
        open
        onClose={onClose}
        src="data:image/png;base64,abc"
        alt="Screenshot"
        fileName="ui.png"
        width={800}
        height={600}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
