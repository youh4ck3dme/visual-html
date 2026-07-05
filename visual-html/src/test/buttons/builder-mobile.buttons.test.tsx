import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { promptLibrary } from "@/lib/builder/prompt-library";
import { getServerFnMocks } from "@/test/mocks/server-fns";
import { mockAbortAwareHangingChat, mockServerAiOnly } from "@/test/helpers/builder-chat-mock";
import { setIphoneViewport } from "@/test/helpers/viewport";
import type { IphoneViewportProfile } from "@/lib/iphone-viewport";
import { renderBuilderWorkspace } from "@/test/test-utils";

async function waitForMobileStudio() {
  await waitFor(() => expect(screen.getByTestId("builder-mobile-studio")).toBeInTheDocument());
}

async function openGenerationTrace(user: ReturnType<typeof userEvent.setup>) {
  const tracePanel = await screen.findByTestId("builder-generation-trace");
  if (tracePanel.getAttribute("data-trace-expanded") !== "true") {
    await user.click(screen.getByTestId("builder-generation-trace-trigger"));
  }
  await waitFor(() => expect(tracePanel).toHaveAttribute("data-trace-expanded", "true"));
  return tracePanel;
}

async function expandAllTemplates(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("builder-mobile-view-all"));
  await waitFor(() =>
    expect(screen.getByTestId("builder-template-snake-game")).toBeInTheDocument(),
  );
}

async function loadSnakePreview(user: ReturnType<typeof userEvent.setup>) {
  const { builderChat } = getServerFnMocks();
  builderChat.mockReset();
  builderChat.mockResolvedValue({ ok: false, message: "missing server key" });
  await expandAllTemplates(user);
  await user.click(screen.getByTestId("builder-template-snake-game"));
  await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
    timeout: 10000,
  });
}

describe("buttons › builder-mobile", () => {
  beforeEach(() => {
    localStorage.removeItem("vibecraft_workspace_v1");
    setIphoneViewport("air");
  });

  it("nav-settings — opens BYOK dialog", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.click(screen.getByTestId("nav-settings"));
    expect(await screen.findByText("Mistral BYOK")).toBeInTheDocument();
  });

  it("builder-template-snake-game — starts generation", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument();
  });

  it("builder-send — disabled when input empty", async () => {
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    expect(screen.getByTestId("builder-send")).toBeDisabled();
  });

  it("builder-send — enabled with text", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a todo app",
    );
    expect(screen.getByTestId("builder-send")).toBeEnabled();
  });

  it("builder-tab-preview — switches to preview tab", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-tab-preview"));
    expect(screen.getByTestId("builder-tab-preview").className).toMatch(/border-primary/);
  });

  it("builder-tab-code — switches to code tab", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    expect(screen.getByTestId("builder-tab-code").className).toMatch(/border-primary/);
    expect(screen.getByLabelText("HTML editor")).toBeInTheDocument();
  });

  it("Run preview — switches to preview when code exists", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-mobile-run-preview"));
    expect(screen.getByTestId("builder-tab-preview").className).toMatch(/border-primary/);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("Refresh preview — remounts preview frame", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    const before = screen.getByTestId("preview-frame-iframe");
    await user.click(screen.getByTestId("builder-mobile-refresh-preview"));
    const after = screen.getByTestId("preview-frame-iframe");
    expect(after).not.toBe(before);
  });

  it("header nav — shows primary routes", async () => {
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    const nav = screen.getByLabelText("Application navigation");
    expect(within(nav).getByLabelText("Projects")).toBeInTheDocument();
    expect(within(nav).getByLabelText("Studio")).toBeInTheDocument();
  });

  it("View all — shows every starter template", async () => {
    const user = userEvent.setup();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.click(screen.getByTestId("builder-mobile-view-all"));
    for (const prompt of promptLibrary) {
      expect(screen.getByTestId(`builder-template-${prompt.id}`)).toBeInTheDocument();
    }
  });

  it("Files tab — disabled with coming soon title", async () => {
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    const filesTab = screen.getByTestId("builder-tab-files");
    expect(filesTab).toBeDisabled();
    expect(filesTab).toHaveAttribute("title", "Coming soon");
  });

  it("Copy code — copies generated HTML on code tab", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-mobile-copy-code"));
    expect(writeText).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("Copy code — shows toast when clipboard fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    renderBuilderWorkspace(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-mobile-copy-code"));
    await waitFor(() =>
      expect(screen.getByText(/Could not copy to clipboard/i)).toBeInTheDocument(),
    );
  });

  describe("HTML health and polish fix", () => {
    beforeEach(() => {
      localStorage.removeItem("visual-html.builder.qualityProfile");
    });

    const POLISH_TRIGGER_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Polish</title><style>
      .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
      .card { width: 1200px; animation: float 3s infinite; }
      @keyframes float { to { transform: translateY(-8px); } }
      button { padding: 8px 16px; }
    </style></head><body><section class="hero"><button>Go</button></section></body></html>`;

    async function generatePolishTriggerPage(user: ReturnType<typeof userEvent.setup>) {
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      builderChat.mockResolvedValue({ ok: true, content: POLISH_TRIGGER_HTML });
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "apple glass premium landing page",
      );
      await user.click(screen.getByTestId("builder-send"));
      await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
        timeout: 10000,
      });
    }

    it("shows HTML health panel on mobile after generation", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await generatePolishTriggerPage(user);

      const studio = screen.getByTestId("builder-mobile-studio");
      await user.click(await within(studio).findByTestId("builder-generation-trace-trigger"));
      const health = await within(studio).findByTestId(
        "builder-html-health",
        {},
        { timeout: 10000 },
      );
      expect(health).toBeInTheDocument();
      expect(within(studio).getByTestId("builder-health-score")).toHaveTextContent(/\/100/);
      expect(within(studio).getByTestId("builder-health-chip-reduced-motion")).toBeInTheDocument();
    }, 15000);

    it("apply polish fix — loads Fix prompt on mobile", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await generatePolishTriggerPage(user);

      const studio = screen.getByTestId("builder-mobile-studio");
      await user.click(await within(studio).findByTestId("builder-generation-trace-trigger"));
      const polishBtn = await within(studio).findByTestId("builder-health-apply-polish-fix");
      await user.click(polishBtn);

      const input = screen.getByPlaceholderText(
        /Build, refine, fix, or explain/i,
      ) as HTMLInputElement;
      expect(input.value).toContain("prefers-reduced-motion");
      expect(input.value).toContain(":focus-visible");
      expect(input.value).toMatch(/max-width: 480px|max-width: 420px/);
      expect(within(studio).getByText("Fix")).toBeInTheDocument();
    }, 15000);

    it("apply polish fix — loads iPhone Air prompt for pwa-mobile profile", async () => {
      localStorage.setItem("visual-html.builder.qualityProfile", "pwa-mobile");
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await generatePolishTriggerPage(user);

      const studio = screen.getByTestId("builder-mobile-studio");
      await user.click(await within(studio).findByTestId("builder-generation-trace-trigger"));
      await user.click(await within(studio).findByTestId("builder-health-apply-polish-fix"));

      const input = screen.getByPlaceholderText(
        /Build, refine, fix, or explain/i,
      ) as HTMLInputElement;
      expect(input.value).toContain("420×912");
      expect(input.value).toContain("safe-area-inset-bottom");
      expect(input.value).toContain("max-width: 420px");
    }, 15000);
  });

  describe("generation cancel and errors", () => {
    beforeEach(() => {
      localStorage.setItem("visual-html.builder.orchestrationMode", "fast");
      localStorage.removeItem("builder_mistral_api_key_1");
      localStorage.removeItem("builder_mistral_api_key_2");
    });

    async function startHangingGeneration(user: ReturnType<typeof userEvent.setup>) {
      const { builderChat } = getServerFnMocks();
      mockAbortAwareHangingChat(builderChat);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a hanging mobile test page",
      );
      await user.click(screen.getByTestId("builder-send"));
      await waitFor(() =>
        expect(screen.getByTestId("builder-generation-status")).toBeInTheDocument(),
      );
    }

    it("shows status strip while generating", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);
      expect(screen.getByTestId("builder-generation-status")).toHaveTextContent(
        /Initializing|Starting|Building|Connecting|Generating HTML/i,
      );
    }, 15000);

    it("shows Cancel generation button during generation", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);
      const cancel = screen.getByTestId("builder-cancel-generation");
      expect(cancel).toBeEnabled();
      expect(cancel).toHaveAttribute("aria-label", "Cancel generation");
    });

    it("clicking Cancel aborts generation and shows cancelled notice", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);

      const abortSpy = vi.spyOn(AbortController.prototype, "abort");
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument(),
      );
      expect(abortSpy).toHaveBeenCalled();
      await waitFor(() =>
        expect(screen.getByTestId("builder-cancelled-notice")).toHaveTextContent(
          /Generation cancelled/i,
        ),
      );
      expect(screen.queryByTestId("builder-mobile-error")).not.toBeInTheDocument();
      abortSpy.mockRestore();
    }, 15000);

    it("user can send another prompt after cancellation", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument(),
      );

      const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
      await user.type(input, "Build a recovery page");
      expect(screen.getByTestId("builder-send")).toBeEnabled();
    }, 15000);

    it("shows mobile error banner when generation fails", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.orchestrationMode", "pro");
      localStorage.setItem("builder_mistral_api_key_1", "sk-test");
      const { builderChat, builderAiStatus } = getServerFnMocks();
      mockServerAiOnly(builderAiStatus);
      builderChat.mockReset();
      builderChat.mockResolvedValue({ ok: false, message: "planner boom" });

      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a failing mobile page",
      );
      await user.click(screen.getByTestId("builder-send"));

      await waitFor(() => expect(screen.getByTestId("builder-mobile-error")).toBeInTheDocument());
      expect(screen.getByTestId("builder-mobile-error")).toHaveTextContent(/Error:/i);
      expect(screen.getByTestId("builder-mobile-error")).toHaveTextContent(/planner boom/i);
      expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument();
    }, 15000);

    it("user can send another prompt after failed generation", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.orchestrationMode", "pro");
      localStorage.setItem("builder_mistral_api_key_1", "sk-test");
      const { builderChat, builderAiStatus } = getServerFnMocks();
      mockServerAiOnly(builderAiStatus);
      builderChat.mockReset();
      builderChat.mockResolvedValue({ ok: false, message: "planner boom" });

      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a failing mobile page",
      );
      await user.click(screen.getByTestId("builder-send"));

      await waitFor(() => expect(screen.getByTestId("builder-mobile-error")).toBeInTheDocument());
      await waitFor(() =>
        expect(screen.queryByTestId("builder-generation-status")).not.toBeInTheDocument(),
      );

      const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
      await user.type(input, "Try again after failure");
      expect(screen.getByTestId("builder-send")).toBeEnabled();
    }, 15000);
  });
});

describe.each(["air", "legacy"] as const)(
  "buttons › builder-mobile viewport %s",
  (profile: IphoneViewportProfile) => {
    beforeEach(() => {
      localStorage.removeItem("vibecraft_workspace_v1");
      setIphoneViewport(profile);
    });

    it("builder-send — disabled when input empty", async () => {
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      expect(screen.getByTestId("builder-send")).toBeDisabled();
    });

    it("builder-send — enabled with text", async () => {
      const user = userEvent.setup();
      renderBuilderWorkspace(<BuilderWorkspace />);
      await waitForMobileStudio();
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a todo app",
      );
      expect(screen.getByTestId("builder-send")).toBeEnabled();
    });

    it("matches profile logical width", () => {
      const expected = profile === "air" ? 420 : 393;
      expect(window.innerWidth).toBe(expected);
    });
  },
);
