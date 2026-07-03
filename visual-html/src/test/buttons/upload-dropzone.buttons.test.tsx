import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { UploadDropzone } from "@/components/pngto/upload-dropzone";
import { renderWithProviders } from "@/test/test-utils";

describe("buttons › upload-dropzone", () => {
  it("Choose file — opens hidden file input (clickable)", async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    const onError = vi.fn();
    renderWithProviders(<UploadDropzone onFile={onFile} onError={onError} />);

    const choose = screen.getByRole("button", { name: /Choose file/i });
    expect(choose).toBeEnabled();

    const input = screen.getByLabelText("Upload image file") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    await user.click(choose);
    expect(clickSpy).toHaveBeenCalled();
  });
});