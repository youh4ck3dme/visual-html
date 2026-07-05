import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { OutputPanel } from "@/components/app/output-panel";
import { PreviewFrame } from "@/components/pngto/preview-frame";
import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";
import {
  IPHONE_17_AIR,
  renderAtIphone,
  setupIphoneTest,
} from "@/test/mobile/iphone-viewport.helpers";

const NEXUSPRESS_BODY = `
<header class="site-header"><div class="container header-container">
  <a class="site-logo" href="#">NexusPress</a>
</div></header>
<main><section class="hero-section"><div class="container hero-container">
  <h1 class="hero-title">Premium WordPress Solutions</h1>
</div></section></main>`;

const NEXUSPRESS_CSS = `@media (max-width: 420px) { .container { padding: 0 1rem; } }`;

const NEXUSPRESS_DOC = buildSingleFileHtml(
  {
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NexusPress</title></head><body>${NEXUSPRESS_BODY}</body></html>`,
    css: NEXUSPRESS_CSS,
    javascript: "",
  },
  { allowJs: false, title: "NexusPress Preview" },
);

describe("PreviewFrame @ iPhone 17 Air (420×912)", () => {
  beforeEach(() => {
    setupIphoneTest("air");
  });

  it("renders iframe with full-width mobile layout classes", () => {
    renderAtIphone(<PreviewFrame srcDoc={NEXUSPRESS_DOC} allowJs={false} />);
    const iframe = screen.getByTestId("preview-frame-iframe");
    expect(iframe.className).toMatch(/w-full/);
    expect(iframe.className).toMatch(/min-h-\[240px\]/);
  });

  it("preview shell does not overflow horizontally at 420px", () => {
    const { container } = renderAtIphone(
      <PreviewFrame srcDoc={NEXUSPRESS_DOC} allowJs={false} className="h-full" />,
    );
    const shell = container.firstElementChild as HTMLElement;
    expect(window.innerWidth).toBe(IPHONE_17_AIR.logicalWidth);
    expect(shell.scrollWidth).toBeLessThanOrEqual(shell.clientWidth + 1);
  });

  it("shows 44px expand control after preview loads", async () => {
    renderAtIphone(<PreviewFrame srcDoc={NEXUSPRESS_DOC} allowJs={false} />);
    const expandBtn = await screen.findByTestId("preview-expand-fullscreen");
    expect(expandBtn.className).toMatch(/min-h-11/);
  });

  it("opens fullscreen dialog on expand tap", async () => {
    const user = userEvent.setup();
    renderAtIphone(<PreviewFrame srcDoc={NEXUSPRESS_DOC} allowJs={false} />);
    await user.click(await screen.findByTestId("preview-expand-fullscreen"));
    expect(screen.getByTestId("preview-fullscreen-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("preview-fullscreen-iframe")).toBeInTheDocument();
  });

  it("hides expand control when srcDoc is empty", async () => {
    renderAtIphone(<PreviewFrame srcDoc="" allowJs={false} />);
    await waitFor(() =>
      expect(screen.queryByTestId("preview-expand-fullscreen")).not.toBeInTheDocument(),
    );
  });
});

describe("OutputPanel mobile preview @ iPhone 17 Air", () => {
  beforeEach(() => {
    setupIphoneTest("air");
  });

  it("shows preview iframe without horizontal overflow", async () => {
    const { container } = renderAtIphone(
      <OutputPanel
        variant="mobile"
        previewDoc={NEXUSPRESS_DOC}
        code={NEXUSPRESS_DOC}
        showDeviceChrome
      />,
    );
    expect(await screen.findByTestId("preview-frame-iframe")).toBeInTheDocument();
    const section = container.querySelector("section") as HTMLElement;
    expect(section.scrollWidth).toBeLessThanOrEqual(section.clientWidth + 1);
  });
});
