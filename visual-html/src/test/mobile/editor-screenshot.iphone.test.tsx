import { beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { EditorModeScreenshot } from "@/components/editor/editor-mode-screenshot";
import {
  computeAppIphoneHealthScore,
  IPHONE_17_AIR,
  IPHONE_LEGACY_COMPACT,
  renderAtIphone,
  setupIphoneTest,
  type IphoneViewportProfile,
} from "@/test/mobile/iphone-viewport.helpers";

describe.each(["air", "legacy"] as const)(
  "editor screenshot @ iPhone %s",
  (profile: IphoneViewportProfile) => {
    beforeEach(() => {
      setupIphoneTest(profile);
    });

    it("renders mobile editor layout with preview and chat panels", async () => {
      renderAtIphone(<EditorModeScreenshot />, profile);

      await waitFor(() => {
        expect(screen.getByTestId("editor-layout")).toBeInTheDocument();
      });
      expect(screen.getByTestId("editor-preview-stage")).toBeInTheDocument();
      expect(screen.getByTestId("editor-chat-panel")).toBeInTheDocument();
      expect(screen.getByTestId("editor-prompt-bar")).toBeInTheDocument();
    });

    it("shows upload dropzone with 44px choose-file control", async () => {
      renderAtIphone(<EditorModeScreenshot />, profile);

      const choose = await screen.findByTestId("upload-choose-file");
      expect(choose).toBeInTheDocument();
      expect(choose.className).toMatch(/min-h-11/);
    });

    it("renders mode tabs for input switching", async () => {
      renderAtIphone(<EditorModeScreenshot />, profile);

      expect(await screen.findByRole("tab", { name: /Upload/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /URL/i })).toBeInTheDocument();
    });

    it("editor header includes safe-area top padding class", async () => {
      renderAtIphone(<EditorModeScreenshot />, profile);

      const header = await screen.findByTestId("editor-header");
      expect(header.className).toMatch(/safe-area-inset-top/);
    });

    it("prompt bar wrapper uses safe-area bottom padding", async () => {
      renderAtIphone(<EditorModeScreenshot />, profile);

      const promptBar = await waitFor(() => screen.getByTestId("editor-prompt-bar"));
      expect(promptBar.className).toMatch(/safe-area-inset-bottom/);
    });

    it("viewport width matches profile constant", () => {
      const device = profile === "air" ? IPHONE_17_AIR : IPHONE_LEGACY_COMPACT;
      expect(window.innerWidth).toBe(device.logicalWidth);
      expect(window.innerHeight).toBe(device.logicalHeight);
    });

    it("editor layout does not overflow horizontally", async () => {
      const { container } = renderAtIphone(<EditorModeScreenshot />, profile);
      await waitFor(() => expect(screen.getByTestId("editor-layout")).toBeInTheDocument());

      const layout = container.querySelector('[data-testid="editor-layout"]') as HTMLElement;
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    });
  },
);

describe("editor screenshot iPhone health score", () => {
  it("reports 100 when all mobile shell checks pass", () => {
    const score = computeAppIphoneHealthScore([true, true, true, true]);
    expect(score).toBe(100);
  });
});
