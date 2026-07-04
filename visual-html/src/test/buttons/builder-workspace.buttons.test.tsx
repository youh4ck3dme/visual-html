import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT } from "@/lib/builder/quality-fix-prompts";
import { promptCategories, promptLibrary } from "@/lib/builder/prompt-library";
import * as download from "@/lib/utils/download";
import { getServerFnMocks } from "@/test/mocks/server-fns";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/lib/utils/download", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/download")>();
  return { ...actual, downloadTextFile: vi.fn() };
});

const TRACE_FRIENDLY_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Trace Friendly</title><style>button:focus-visible{outline:1px solid #fff}</style></head><body><button>Go</button></body></html>`;

async function openGenerationTrace(user: ReturnType<typeof userEvent.setup>) {
  const tracePanel = await screen.findByTestId("builder-generation-trace");
  if (tracePanel.getAttribute("data-trace-expanded") !== "true") {
    await user.click(screen.getByTestId("builder-generation-trace-trigger"));
  }
  await waitFor(() => expect(tracePanel).toHaveAttribute("data-trace-expanded", "true"));
  return tracePanel;
}

describe("buttons › builder-workspace", () => {
  beforeEach(() => {
    localStorage.removeItem("vibecraft_workspace_v1");
  });

  it("startTemplateId photo-portfolio — auto-starts Photographer Lightbox generation", async () => {
    renderWithProviders(<BuilderWorkspace startTemplateId="photo-portfolio" />);
    await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it("New Application — resets workspace messages", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: /New Application/i }));
    expect(screen.getByText(/New workspace/i)).toBeInTheDocument();
  });

  it.each(promptCategories.map((c) => [c.name, c.id] as const))(
    "category %s — click switches active category",
    async (name) => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      const btn = screen.getByRole("button", { name });
      await user.click(btn);
      expect(btn.className).toMatch(/bg-shell-hover|text-foreground/);
    },
  );

  it.each(promptLibrary.map((p) => [p.title, p.category] as const))(
    "starter template %s — click starts generation",
    async (title, category) => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      const catName =
        promptCategories.find((c) => c.id === category)?.name ?? "Portfolios & Resumes";
      await user.click(screen.getByRole("button", { name: catName }));
      await user.click(screen.getByRole("button", { name: new RegExp(title, "i") }));
      await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
        timeout: 5000,
      });
    },
  );

  it("category Landing Pages — shows WordPress marketing landing starter", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: "Landing Pages" }));
    expect(
      screen.getByRole("button", { name: /WordPress Marketing Landing/i }),
    ).toBeInTheDocument();
  });

  it("shows Server AI ready when server env keys are configured", async () => {
    const { builderAiStatus } = getServerFnMocks();
    builderAiStatus.mockResolvedValueOnce({ serverKeysConfigured: true });
    renderWithProviders(<BuilderWorkspace />);
    await waitFor(() => expect(screen.getByText("Server AI ready")).toBeInTheDocument());
    expect(screen.getByText(/MISTRAL_API_KEY from server env/i)).toBeInTheDocument();
  });

  it("Settings — opens BYOK dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByLabelText("Settings"));
    expect(await screen.findByText("Mistral BYOK")).toBeInTheDocument();
  });

  it.each(["Build", "Refine", "Fix", "Explain"] as const)(
    "mode %s — Build always enabled; others need generated code",
    async (mode) => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      const btn = screen.getByRole("button", { name: mode });
      if (mode === "Build") {
        expect(btn).toBeEnabled();
        await user.click(btn);
        expect(btn.className).toMatch(/bg-primary/);
      } else {
        expect(btn).toBeDisabled();
      }
    },
  );

  it("Send prompt — enabled with text and submits", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a todo app",
    );
    const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
    const submit = within(input.closest("form")!).getAllByRole("button").at(-1)!;
    expect(submit).toBeEnabled();
    await user.click(submit);
    await waitFor(() => expect(screen.getByPlaceholderText(/AI is working/i)).toBeInTheDocument(), {
      timeout: 3000,
    });
    await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
      timeout: 10000,
    });
  });

  it("Send prompt — disabled when input empty", () => {
    renderWithProviders(<BuilderWorkspace />);
    const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
    const form = input.closest("form")!;
    const submit = within(form).getAllByRole("button").at(-1)!;
    expect(submit).toBeDisabled();
  });

  async function loadSnakePreview(user: ReturnType<typeof userEvent.setup>) {
    // Return a fallback-safe server failure so generateBuilderCode uses the offline
    // snake mock (contains <script>) after retry exhaustion.
    const { builderChat } = getServerFnMocks();
    builderChat.mockReset();
    builderChat.mockResolvedValue({ ok: false, message: "missing server key" });
    await user.click(screen.getByRole("button", { name: "Interactive Games" }));
    await user.click(screen.getByRole("button", { name: /Retro Snake Game/i }));
    await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
      timeout: 10000,
    });
  }

  it("preview — disables JavaScript by default and sanitizes script tags", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await loadSnakePreview(user);

    const iframe = screen.getByTestId("preview-frame-iframe");
    expect(iframe).toHaveAttribute("sandbox", "");
    expect((iframe as HTMLIFrameElement).srcdoc?.toLowerCase() ?? "").not.toContain("<script");
    expect(screen.getByTestId("builder-preview-allow-js")).not.toBeChecked();
  });

  it("preview — JS toggle enables script sandbox mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await loadSnakePreview(user);

    const iframe = screen.getByTestId("preview-frame-iframe");
    await user.click(screen.getByTestId("builder-preview-allow-js"));
    expect(screen.getByTestId("builder-preview-allow-js")).toBeChecked();
    expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
    expect((iframe as HTMLIFrameElement).srcdoc?.toLowerCase() ?? "").toContain("<script");
  });

  it("preview — shows security warning for suspicious HTML before risky JS opt-in", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithProviders(<BuilderWorkspace />);
    await loadSnakePreview(user);

    await user.click(screen.getByRole("button", { name: /Code/i }));
    const editor = screen.getByLabelText("HTML editor");
    const risky = '<script src="https://evil.example/payload.js"></script>';
    await user.type(editor, risky);

    await user.click(screen.getByRole("button", { name: /Live Preview/i }));
    const warningSection = screen.getByText(/Security Warning/i).parentElement!.parentElement!;
    expect(warningSection).toBeInTheDocument();
    expect(within(warningSection).getByText(/External script/i)).toBeInTheDocument();

    await user.click(screen.getByTestId("builder-preview-allow-js"));
    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByTestId("builder-preview-allow-js")).not.toBeChecked();
    confirmSpy.mockRestore();
  });

  it("Live Preview / Code tabs — switch preview panel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: "Interactive Games" }));
    await user.click(screen.getByRole("button", { name: /Retro Snake Game/i }));
    await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
      timeout: 10000,
    });
    await user.click(screen.getByRole("button", { name: /Code/i }));
    expect(screen.getByLabelText("HTML editor")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Live Preview/i }));
    expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument();
  });

  it("Settings dialog — Show Keys toggles input type", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByLabelText("Settings"));
    const showBtn = await screen.findByRole("button", { name: /Show Keys/i });
    await user.click(showBtn);
    expect(screen.getByLabelText("API Key 1")).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /Hide Keys/i }));
    expect(screen.getByLabelText("API Key 1")).toHaveAttribute("type", "password");
  });

  it("Settings dialog — Cancel closes without saving keys", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByLabelText("Settings"));
    await user.type(await screen.findByLabelText("API Key 1"), "sk-test");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Mistral BYOK")).not.toBeInTheDocument();
    expect(localStorage.getItem("builder_mistral_api_key_1")).toBeNull();
  });

  it("Copy — copies generated HTML to clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: "Interactive Games" }));
    await user.click(screen.getByRole("button", { name: /Retro Snake Game/i }));
    await waitFor(() => screen.getByRole("button", { name: /Copy/i }));
    await user.click(screen.getByRole("button", { name: /^Copy$/i }));
    expect(writeText).toHaveBeenCalled();
  });

  it("Download — downloads generated HTML file", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: "Interactive Games" }));
    await user.click(screen.getByRole("button", { name: /Retro Snake Game/i }));
    await waitFor(() => screen.getByRole("button", { name: /Download/i }));
    await user.click(screen.getByRole("button", { name: /Download/i }));
    expect(download.downloadTextFile).toHaveBeenCalledWith(
      "vibecraft-application.html",
      expect.stringContaining("<!DOCTYPE html>"),
    );
  });

  it("Save manual edit — saves version after code change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: "Interactive Games" }));
    await user.click(screen.getByRole("button", { name: /Retro Snake Game/i }));
    await waitFor(() => screen.getByTitle("VibeCraft Preview"));
    await user.click(screen.getByRole("button", { name: /Code/i }));
    const editor = screen.getByLabelText("HTML editor");
    await user.type(editor, "\n<!-- edited -->");
    const saveBtn = await screen.findByRole("button", { name: /^Save$/i });
    await user.click(saveBtn);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /^Save$/i })).not.toBeInTheDocument(),
    );
  });

  it("Settings dialog — Clear keys removes BYOK", async () => {
    const user = userEvent.setup();
    localStorage.setItem("builder_mistral_api_key_1", "sk-old");
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByLabelText("Settings"));
    const dialog = await screen.findByRole("dialog");
    const trash = within(dialog)
      .getAllByRole("button")
      .find((btn) => btn.querySelector(".lucide-trash-2"))!;
    await user.click(trash);
    expect(localStorage.getItem("builder_mistral_api_key_1")).toBeNull();
    expect(screen.getByText("Demo Mode")).toBeInTheDocument();
  });

  it("Settings dialog — Save stores BYOK keys", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByLabelText("Settings"));
    await user.type(await screen.findByLabelText("API Key 1"), "sk-test-key");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByText("Mistral BYOK")).not.toBeInTheDocument());
    expect(localStorage.getItem("builder_mistral_api_key_1")).toBe("sk-test-key");
    expect(screen.getByText("BYOK Ready")).toBeInTheDocument();
  });

  describe("generation cancel", () => {
    beforeEach(() => {
      localStorage.setItem("visual-html.builder.orchestrationMode", "fast");
      localStorage.removeItem("builder_mistral_api_key_1");
      localStorage.removeItem("builder_mistral_api_key_2");
    });

    async function getSubmitButton() {
      const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
      return within(input.closest("form")!).getAllByRole("button").at(-1)!;
    }

    async function startHangingGeneration(user: ReturnType<typeof userEvent.setup>) {
      const { builderChat } = getServerFnMocks();
      builderChat.mockReset();
      builderChat.mockImplementation(() => new Promise(() => {}));
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a hanging test page",
      );
      await user.click(await getSubmitButton());
      await waitFor(() =>
        expect(screen.getByTestId("builder-cancel-generation")).toBeInTheDocument(),
      );
    }

    it("shows Cancel button while generating and hides it when idle", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument();

      await startHangingGeneration(user);
      expect(screen.getByTestId("builder-cancel-generation")).toBeInTheDocument();

      const abortSpy = vi.spyOn(AbortController.prototype, "abort");
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument(),
      );
      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });

    it("does not show error feedback when generation is cancelled", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      await startHangingGeneration(user);
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.getByTestId("builder-cancelled-notice")).toHaveTextContent(
          /Generation cancelled/i,
        ),
      );
      expect(screen.queryByText(/Generation failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
    });

    it("shows collapsible generation trace during generation", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      await startHangingGeneration(user);

      const tracePanel = await screen.findByTestId("builder-generation-trace");
      expect(tracePanel).toBeInTheDocument();
      expect(tracePanel).toHaveAttribute("data-trace-expanded", "false");

      await user.click(screen.getByTestId("builder-generation-trace-trigger"));
      expect(tracePanel).toHaveAttribute("data-trace-expanded", "true");
      expect(screen.getByTestId("builder-trace-step-building")).toBeInTheDocument();

      await user.click(screen.getByTestId("builder-cancel-generation"));
      await waitFor(() =>
        expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument(),
      );
    });

    it("shows Quality Profile dropdown in settings", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      await user.click(screen.getByLabelText("Settings"));
      expect(await screen.findByTestId("builder-quality-profile-select")).toBeInTheDocument();
      expect(screen.getByTestId("builder-quality-profile")).toBeInTheDocument();
    });

    it("shows recommended mode badge for selected profile", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.qualityProfile", "neon-parallax");
      renderWithProviders(<BuilderWorkspace />);
      await user.click(screen.getByLabelText("Settings"));
      const recommended = await screen.findByTestId("builder-quality-profile-recommended-mode");
      expect(recommended).toHaveTextContent(/Recommended|Odporúčané/i);
      expect(recommended).toHaveTextContent(/Beast/i);
    });

    it("shows fast warning for Neon Parallax with Fast mode", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.qualityProfile", "neon-parallax");
      localStorage.setItem("visual-html.builder.orchestrationMode", "fast");
      renderWithProviders(<BuilderWorkspace />);
      await user.click(screen.getByLabelText("Settings"));
      expect(await screen.findByTestId("builder-quality-profile-fast-warning")).toHaveTextContent(
        /Pro or Beast/i,
      );
    });

    it("apply polish fix — loads Fix prompt when motion/focus/responsive warnings exist", async () => {
      const user = userEvent.setup();
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      builderChat.mockResolvedValue({
        ok: true,
        content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Polish</title><style>
          .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
          .card { width: 1200px; animation: float 3s infinite; }
          @keyframes float { to { transform: translateY(-8px); } }
          button { padding: 8px 16px; }
        </style></head><body><section class="hero"><button>Go</button></section></body></html>`,
      });

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "apple glass premium landing page",
      );
      await user.click(await getSubmitButton());

      await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
        timeout: 10000,
      });
      await openGenerationTrace(user);

      const polishBtn = await screen.findByTestId("builder-health-apply-polish-fix");
      await user.click(polishBtn);

      const input = screen.getByPlaceholderText(
        /Build, refine, fix, or explain/i,
      ) as HTMLInputElement;
      expect(input.value).toContain("prefers-reduced-motion");
      expect(input.value).toContain(":focus-visible");
      expect(input.value).toContain("max-width: 480px");
      expect(screen.getByRole("button", { name: "Fix" }).className).toMatch(/bg-primary/);
    });

    it("shows HTML health score after a successful generation", async () => {
      const user = userEvent.setup();
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      builderChat.mockResolvedValue({
        ok: true,
        content: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Health UI</title><style>button:focus-visible{outline:2px solid #fff}</style></head><body><button>Go</button></body></html>`,
      });

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a health score page",
      );
      await user.click(await getSubmitButton());

      await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
        timeout: 10000,
      });

      await openGenerationTrace(user);
      const health = await screen.findByTestId("builder-html-health");
      expect(health).toBeInTheDocument();
      expect(screen.getByTestId("builder-health-score")).toHaveTextContent(/\/100/);
      expect(screen.getByTestId("builder-health-profile")).toBeInTheDocument();
      expect(screen.getByTestId("builder-health-minimum-expected-score")).toBeInTheDocument();
    });

    it("auto-expands trace when health check has critical findings", async () => {
      const user = userEvent.setup();
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      builderChat.mockResolvedValue({
        ok: true,
        content: `<!DOCTYPE html><html><head><title>Bad</title></head><body><script src="https://evil.example/x.js"></script></body></html>`,
      });

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a critical health page",
      );
      await user.click(await getSubmitButton());

      await waitFor(() => {
        const tracePanel = screen.getByTestId("builder-generation-trace");
        expect(tracePanel).toHaveAttribute("data-trace-expanded", "true");
      });
      expect(screen.getByTestId("builder-health-critical-count")).toHaveTextContent(/[1-9]/);
    });

    it("clears previous HTML health result on new generation", async () => {
      const user = userEvent.setup();
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      builderChat
        .mockResolvedValueOnce({
          ok: true,
          content: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>One</title><style>button:focus-visible{outline:1px solid #fff}</style></head><body><button>One</button></body></html>`,
        })
        .mockImplementationOnce(() => new Promise(() => {}));

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build first health page",
      );
      await user.click(await getSubmitButton());
      await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
        timeout: 10000,
      });
      await user.click(screen.getByTestId("builder-generation-trace-trigger"));
      expect(await screen.findByTestId("builder-html-health")).toBeInTheDocument();

      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build second hanging page",
      );
      await user.click(await getSubmitButton());
      await waitFor(() =>
        expect(screen.getByTestId("builder-cancel-generation")).toBeInTheDocument(),
      );
      expect(screen.queryByTestId("builder-html-health")).not.toBeInTheDocument();
    });

    it("shows compact metrics summary after a successful generation", async () => {
      const user = userEvent.setup();
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      builderChat.mockResolvedValue({
        ok: true,
        content: TRACE_FRIENDLY_HTML,
      });

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a metrics summary page",
      );
      await user.click(await getSubmitButton());

      await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
        timeout: 10000,
      });

      await openGenerationTrace(user);
      const summary = await screen.findByTestId("builder-trace-metrics-summary");
      expect(summary).toBeInTheDocument();
      expect(screen.getByTestId("builder-metrics-ai-calls")).toHaveTextContent(/1/);
      expect(screen.getByTestId("builder-metrics-retries")).toHaveTextContent(/0/);
      expect(screen.getByTestId("builder-metrics-timeouts")).toHaveTextContent(/0/);
      expect(screen.getByTestId("builder-metrics-fallbacks")).toHaveTextContent(/0/);
    });

    it("does not show error feedback when cancelled during retry delay", async () => {
      const user = userEvent.setup();
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      let chatCalls = 0;
      builderChat.mockImplementation(async () => {
        chatCalls += 1;
        if (chatCalls === 1) return { ok: false, message: "network timeout" };
        return new Promise(() => {});
      });

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a retry backoff cancel test page",
      );
      await user.click(await getSubmitButton());

      await waitFor(() =>
        expect(screen.getByTestId("builder-cancel-generation")).toBeInTheDocument(),
      );
      await waitFor(() => expect(chatCalls).toBeGreaterThanOrEqual(1));
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.getByTestId("builder-cancelled-notice")).toHaveTextContent(
          /Generation cancelled/i,
        ),
      );
      expect(screen.queryByText(/Generation failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
    });

    it("shows retried once in trace after a retryable step succeeds", async () => {
      const user = userEvent.setup();
      const fetchMock = vi
        .fn()
        .mockRejectedValue(new Error("browser path should not run in this test"));
      vi.stubGlobal("fetch", fetchMock);
      const { builderChat, builderAiStatus } = getServerFnMocks();
      builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
      builderChat.mockReset();
      let chatCalls = 0;
      builderChat.mockImplementation(async () => {
        chatCalls += 1;
        if (chatCalls === 1) return { ok: false, message: "network timeout" };
        return {
          ok: true,
          content: TRACE_FRIENDLY_HTML,
        };
      });

      try {
        renderWithProviders(<BuilderWorkspace />);
        await user.type(
          screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
          "Build a retry test page",
        );
        await user.click(await getSubmitButton());

        await waitFor(() => expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument(), {
          timeout: 10000,
        });

        await openGenerationTrace(user);
        const buildingStep = await screen.findByTestId("builder-trace-step-building");
        expect(buildingStep).toHaveAttribute("data-trace-retry-count", "1");
        expect(screen.getByTestId("builder-trace-retried-building")).toHaveTextContent(
          /retried once/i,
        );
        expect(fetchMock).not.toHaveBeenCalled();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("auto-expands generation trace when a step fails", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.orchestrationMode", "pro");
      localStorage.setItem("builder_mistral_api_key_1", "sk-test");
      const { builderChat } = getServerFnMocks();
      builderChat.mockReset();
      builderChat.mockResolvedValue({ ok: false, message: "planner boom" });

      renderWithProviders(<BuilderWorkspace />);
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Build a failing page",
      );
      await user.click(await getSubmitButton());

      await waitFor(() => {
        const tracePanel = screen.getByTestId("builder-generation-trace");
        expect(tracePanel).toHaveAttribute("data-trace-failed", "true");
        expect(tracePanel).toHaveAttribute("data-trace-expanded", "true");
      });
      expect(screen.getByTestId("builder-trace-step-planning")).toHaveAttribute(
        "data-trace-status",
        "failed",
      );
    });

    it("keeps the last successful preview after cancellation", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      await loadSnakePreview(user);

      const iframe = screen.getByTestId("preview-frame-iframe") as HTMLIFrameElement;
      expect(iframe.srcdoc ?? "").toContain("Retro Neon Snake");

      const { builderChat } = getServerFnMocks();
      builderChat.mockReset();
      builderChat.mockImplementation(() => new Promise(() => {}));

      await user.click(screen.getByRole("button", { name: "Refine" }));
      await user.type(
        screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
        "Make the snake blue",
      );
      await user.click(await getSubmitButton());

      await waitFor(() =>
        expect(screen.getByTestId("builder-cancel-generation")).toBeInTheDocument(),
      );
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.getByTestId("builder-cancelled-notice")).toBeInTheDocument(),
      );

      const afterCancel = screen.getByTestId("preview-frame-iframe") as HTMLIFrameElement;
      expect(afterCancel.srcdoc ?? "").toContain("Retro Neon Snake");
    });
  });
});
