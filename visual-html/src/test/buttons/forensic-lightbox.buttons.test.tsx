import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { ForensicLightbox } from "@/components/pngto/forensic-lightbox";
import { analyzeImageForensics, FORENSIC_PRESETS } from "@/lib/image-forensics";
import { renderWithProviders } from "@/test/test-utils";
import { MOCK_FORENSIC_REPORT } from "@/test/mocks/forensic-report";
import { SAMPLE_GENERATION_OPTIONS } from "@/test/mocks/sample-image";

function renderOpen(props?: Partial<Parameters<typeof ForensicLightbox>[0]>) {
  const onClose = vi.fn();
  const onGenerate = vi.fn();
  renderWithProviders(
    <ForensicLightbox
      open
      onClose={onClose}
      onGenerate={onGenerate}
      src="data:image/png;base64,abc"
      alt="test"
      fileName="ui.png"
      width={1200}
      height={800}
      fileSize={120_000}
      options={SAMPLE_GENERATION_OPTIONS}
      {...props}
    />,
  );
  return { onClose, onGenerate };
}

describe("buttons › forensic-lightbox", () => {
  beforeEach(() => {
    vi.mocked(analyzeImageForensics).mockResolvedValue(MOCK_FORENSIC_REPORT);
  });

  it("Close forensic view — calls onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderOpen();
    await waitFor(() => expect(screen.getByText("Header")).toBeInTheDocument());
    await user.click(screen.getByLabelText("Close forensic view"));
    expect(onClose).toHaveBeenCalled();
  });

  it.each(MOCK_FORENSIC_REPORT.zones.map((z) => [z.label, z.id] as const))(
    "zone list %s — selects zone",
    async (label) => {
      const user = userEvent.setup();
      renderOpen();
      await waitFor(() => expect(screen.getByText(label)).toBeInTheDocument());
      const zoneButtons = screen.getAllByRole("button", { name: new RegExp(label) });
      await user.click(zoneButtons[0]);
      expect(screen.getByText(`Target: ${label}`)).toBeInTheDocument();
    },
  );

  it("Heatmap toggle — switches label off/on", async () => {
    const user = userEvent.setup();
    renderOpen();
    await waitFor(() => expect(screen.getByText(/Heatmap on/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Heatmap on/i }));
    expect(screen.getByRole("button", { name: /Heatmap off/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Heatmap off/i }));
    expect(screen.getByRole("button", { name: /Heatmap on/i })).toBeInTheDocument();
  });

  it.each(FORENSIC_PRESETS.map((p) => [p.label, p.id] as const))(
    "preset %s — toggles active state",
    async (label) => {
      const user = userEvent.setup();
      renderOpen();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument(),
      );
      const preset = screen.getByRole("button", { name: new RegExp(label, "i") });
      await user.click(preset);
      expect(preset.className).toMatch(/border-primary/);
      await user.click(preset);
      expect(preset.className).not.toMatch(/bg-primary\/10 font-semibold/);
    },
  );

  it("Generate full page — calls onGenerate and onClose", async () => {
    const user = userEvent.setup();
    const { onClose, onGenerate } = renderOpen();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Generate full page/i })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: /Generate full page/i }));
    expect(onGenerate).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalled();
    expect(onGenerate.mock.calls[0][0].additionalInstructions).toBeTruthy();
  });

  it("Generate this section — calls onGenerate with region mode", async () => {
    const user = userEvent.setup();
    const { onClose, onGenerate } = renderOpen();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Generate this section/i })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: /Generate this section/i }));
    expect(onGenerate).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalled();
  });

  it("Generate this section — disabled while loading", () => {
    vi.mocked(analyzeImageForensics).mockImplementationOnce(() => new Promise(() => undefined));
    renderOpen();
    expect(screen.getByRole("button", { name: /Generate this section/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Generate full page/i })).toBeDisabled();
  });
});