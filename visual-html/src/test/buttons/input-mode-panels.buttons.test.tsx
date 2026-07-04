import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import {
  ImportInputPanel,
  TextInputPanel,
  UrlInputPanel,
} from "@/components/pngto/input-mode-panels";
import { SAVED_PROJECT_SCHEMA_VERSION } from "@/lib/projects-schema";
import { renderWithProviders } from "@/test/test-utils";
import { fetchImageFromUrlMock } from "@/test/mocks/server-fns";

const SAMPLE_PROJECT = {
  schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
  id: "imported-1",
  name: "Imported landing",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z",
  fileName: "landing.png",
  imageWidth: 1200,
  imageHeight: 800,
  thumbnailDataUrl: "data:image/jpeg;base64,abc",
  options: {
    outputMode: "static" as const,
    stylingMode: "vanilla-css" as const,
    responsiveness: "adaptive" as const,
    accessibilityLevel: "strict" as const,
  },
  result: {
    html: "<main>Hi</main>",
    css: "main{color:red}",
    javascript: "",
    explanation: "Demo",
    accessibilityNotes: "",
    responsiveNotes: "",
    assumptions: [],
    warnings: [],
  },
};

describe("buttons › input-mode-panels", () => {
  it("URL panel — empty URL reports error", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    renderWithProviders(<UrlInputPanel onFile={vi.fn()} onError={onError} />);

    await user.click(screen.getByTestId("input-url-load"));
    expect(onError).toHaveBeenCalledWith("Enter an image URL.");
  });

  it("URL panel — loads remote image via server fn", async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    renderWithProviders(<UrlInputPanel onFile={onFile} onError={vi.fn()} />);

    await user.type(screen.getByTestId("input-url-field"), "https://example.com/ui.png");
    await user.click(screen.getByTestId("input-url-load"));

    await waitFor(() => expect(onFile).toHaveBeenCalledOnce());
    expect(fetchImageFromUrlMock.mock).toHaveBeenCalled();
    expect(onFile.mock.calls[0]?.[0]).toMatchObject({ mimeType: "image/png" });
  });

  it("Text panel — empty description reports error", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    renderWithProviders(
      <TextInputPanel onFile={vi.fn()} onError={onError} onDescription={vi.fn()} />,
    );

    await user.click(screen.getByTestId("input-text-apply"));
    expect(onError).toHaveBeenCalledWith("Enter a UI description.");
  });

  it("Text panel — applies description and uploads rendered image", async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    const onDescription = vi.fn();
    renderWithProviders(
      <TextInputPanel onFile={onFile} onError={vi.fn()} onDescription={onDescription} />,
    );

    await user.type(screen.getByTestId("input-text-field"), "Dashboard with sidebar");
    await user.click(screen.getByTestId("input-text-apply"));

    await waitFor(() => expect(onDescription).toHaveBeenCalledWith("Dashboard with sidebar"));
    await waitFor(() => expect(onFile).toHaveBeenCalledOnce());
    expect(onFile.mock.calls[0]?.[0]).toMatchObject({ mimeType: "image/png" });
  });

  it("Import panel — invalid JSON reports error", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    renderWithProviders(
      <ImportInputPanel onImported={vi.fn().mockResolvedValue(null)} onError={onError} />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["not-json"], "broken.json", { type: "application/json" });
    await user.upload(input, file);

    await waitFor(() => expect(onError).toHaveBeenCalledWith("Invalid or empty project file."));
  });

  it("Import panel — valid project file calls onImported", async () => {
    const user = userEvent.setup();
    const onImported = vi.fn().mockResolvedValue("imported-1");
    renderWithProviders(<ImportInputPanel onImported={onImported} onError={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([JSON.stringify(SAMPLE_PROJECT)], "projects.json", {
      type: "application/json",
    });
    await user.upload(input, file);

    await waitFor(() => expect(onImported).toHaveBeenCalledOnce());
    expect(onImported.mock.calls[0]?.[0]).toHaveLength(1);
    expect(onImported.mock.calls[0]?.[0][0]?.id).toBe("imported-1");
  });
});
