import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ImagePreview } from "@/components/pngto/image-preview";
import { renderWithProviders } from "@/test/test-utils";
import { MOCK_FORENSIC_REPORT } from "@/test/mocks/forensic-report";
import { getForensicsMock } from "@/test/mocks/server-fns";
import { makeUploadedImage, SAMPLE_GENERATION_OPTIONS } from "@/test/mocks/sample-image";

describe("buttons › image-preview", () => {
  beforeEach(() => {
    getForensicsMock().mockResolvedValue(MOCK_FORENSIC_REPORT);
  });

  it("Forensic thumbnail — opens forensic lightbox", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ImagePreview
        image={makeUploadedImage()}
        options={SAMPLE_GENERATION_OPTIONS}
        onRemove={vi.fn()}
        onForensicGenerate={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText(/Forensic scan:/));
    expect(await screen.findByText("Forensic scan")).toBeInTheDocument();
    expect(getForensicsMock()).toHaveBeenCalled();
  });

  it("Remove image — calls onRemove", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWithProviders(
      <ImagePreview
        image={makeUploadedImage()}
        options={SAMPLE_GENERATION_OPTIONS}
        onRemove={onRemove}
        onForensicGenerate={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText("Remove image"));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
