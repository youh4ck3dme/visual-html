import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ModeTabs, TopCreditBar } from "@/components/pngto/home-workspace";
import { UploadDropzone } from "@/components/pngto/upload-dropzone";
import type { InputMode } from "@/lib/input-mode";
import {
  IPHONE_17_AIR,
  IPHONE_LEGACY_COMPACT,
  renderAtIphone,
  setupIphoneTest,
  type IphoneViewportProfile,
} from "@/test/mobile/iphone-viewport.helpers";

const TAB_LABELS: Record<InputMode, RegExp> = {
  upload: /Upload/i,
  url: /URL/i,
  text: /Text/i,
  import: /Import/i,
};

describe.each(["air", "legacy"] as const)(
  "home workspace @ iPhone %s",
  (profile: IphoneViewportProfile) => {
    beforeEach(() => {
      setupIphoneTest(profile);
    });

    it("mode tabs render and switch input mode", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderAtIphone(<ModeTabs value="upload" onChange={onChange} />, profile);

      const urlTab = screen.getByRole("tab", { name: TAB_LABELS.url });
      expect(urlTab).toBeEnabled();
      await user.click(urlTab);
      expect(onChange).toHaveBeenCalledWith("url");
    });

    it("upload dropzone exposes thumb-friendly choose file button", () => {
      renderAtIphone(<UploadDropzone onFile={vi.fn()} onError={vi.fn()} />, profile);

      const btn = screen.getByTestId("upload-choose-file");
      expect(btn.className).toMatch(/min-h-11/);
    });

    it("TopCreditBar uses safe-area top padding", () => {
      renderAtIphone(<TopCreditBar />, profile);
      const bar = screen.getByText(/Mistral OCR/i).closest("div");
      expect(bar?.className).toMatch(/safe-area-inset-top/);
    });

    it("uses correct logical width for profile", () => {
      const device = profile === "air" ? IPHONE_17_AIR : IPHONE_LEGACY_COMPACT;
      expect(window.innerWidth).toBe(device.logicalWidth);
    });
  },
);

describe("home workspace tab accessibility @ iPhone air", () => {
  it("upload tab is current page when selected", () => {
    renderAtIphone(<ModeTabs value="upload" onChange={vi.fn()} />, "air");
    expect(screen.getByRole("tab", { name: TAB_LABELS.upload })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
