import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { PreviewLightbox } from "@/components/pngto/preview-lightbox";
import { renderWithProviders } from "@/test/test-utils";

const SAMPLE_DOC =
  '<!doctype html><html><head><meta charset="utf-8"></head><body><main><h1>Preview</h1></main></body></html>';

describe("buttons › preview-lightbox", () => {
  it("Close — calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <PreviewLightbox open onClose={onClose} srcDoc={SAMPLE_DOC} allowJs={false} />,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("Escape — calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <PreviewLightbox open onClose={onClose} srcDoc={SAMPLE_DOC} allowJs={false} />,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("renders fullscreen iframe with srcdoc content", () => {
    renderWithProviders(
      <PreviewLightbox open onClose={vi.fn()} srcDoc={SAMPLE_DOC} allowJs={false} />,
    );
    const iframe = screen.getByTestId("preview-fullscreen-iframe") as HTMLIFrameElement;
    expect(iframe.getAttribute("srcdoc")).toContain("Preview");
  });
});
