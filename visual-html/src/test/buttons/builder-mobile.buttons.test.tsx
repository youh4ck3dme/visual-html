import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { promptLibrary } from "@/lib/builder/prompt-library";
import { getServerFnMocks } from "@/test/mocks/server-fns";
import { setMobileViewport } from "@/test/helpers/viewport";
import { renderWithProviders } from "@/test/test-utils";

async function waitForMobileStudio() {
  await waitFor(() => expect(screen.getByTestId("builder-mobile-studio")).toBeInTheDocument());
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
    setMobileViewport();
  });

  it("builder-settings — opens BYOK dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.click(screen.getByTestId("builder-settings"));
    expect(await screen.findByText("Mistral BYOK")).toBeInTheDocument();
  });

  it("builder-template-snake-game — starts generation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    expect(screen.getByTitle("VibeCraft Preview")).toBeInTheDocument();
  });

  it("builder-send — disabled when input empty", async () => {
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    expect(screen.getByTestId("builder-send")).toBeDisabled();
  });

  it("builder-send — enabled with text", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a todo app",
    );
    expect(screen.getByTestId("builder-send")).toBeEnabled();
  });

  it("builder-tab-preview — switches to preview tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-tab-preview"));
    expect(screen.getByTestId("builder-tab-preview").className).toMatch(/border-primary/);
  });

  it("builder-tab-code — switches to code tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    expect(screen.getByTestId("builder-tab-code").className).toMatch(/border-primary/);
    expect(screen.getByLabelText("HTML editor")).toBeInTheDocument();
  });

  it("Run preview — switches to preview when code exists", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-mobile-run-preview"));
    expect(screen.getByTestId("builder-tab-preview").className).toMatch(/border-primary/);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("Refresh preview — remounts preview frame", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    const before = screen.getByTestId("preview-frame-iframe");
    await user.click(screen.getByTestId("builder-mobile-refresh-preview"));
    const after = screen.getByTestId("preview-frame-iframe");
    expect(after).not.toBe(before);
  });

  it("Settings tab — opens BYOK dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.click(screen.getByTestId("builder-tab-settings"));
    expect(await screen.findByText("Mistral BYOK")).toBeInTheDocument();
  });

  it("Menu — opens navigation sheet", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.click(screen.getByTestId("builder-mobile-menu-trigger"));
    const menu = await screen.findByTestId("builder-mobile-menu");
    expect(within(menu).getByLabelText("Projects")).toBeInTheDocument();
    expect(within(menu).getByLabelText("VibeCraft")).toBeInTheDocument();
  });

  it("View all — shows every starter template", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await user.click(screen.getByTestId("builder-mobile-view-all"));
    for (const prompt of promptLibrary) {
      expect(screen.getByTestId(`builder-template-${prompt.id}`)).toBeInTheDocument();
    }
  });

  it("Files tab — disabled with coming soon title", async () => {
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    const filesTab = screen.getByTestId("builder-tab-files");
    expect(filesTab).toBeDisabled();
    expect(filesTab).toHaveAttribute("title", "Coming soon");
  });

  it("Copy code — copies generated HTML on code tab", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderWithProviders(<BuilderWorkspace />);
    await waitForMobileStudio();
    await loadSnakePreview(user);
    await user.click(screen.getByTestId("builder-tab-code"));
    await user.click(screen.getByTestId("builder-mobile-copy-code"));
    expect(writeText).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  describe("generation cancel and errors", () => {
    beforeEach(() => {
      localStorage.setItem("visual-html.builder.orchestrationMode", "fast");
      localStorage.removeItem("builder_mistral_api_key_1");
      localStorage.removeItem("builder_mistral_api_key_2");
    });

    async function startHangingGeneration(user: ReturnType<typeof userEvent.setup>) {
      const { builderChat } = getServerFnMocks();
      builderChat.mockReset();
      builderChat.mockImplementation(() => new Promise(() => {}));
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
      renderWithProviders(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);
      expect(screen.getByTestId("builder-generation-status")).toHaveTextContent(
        /Initializing|Starting|Building|Connecting/i,
      );
    });

    it("shows Cancel generation button during generation", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);
      const cancel = screen.getByTestId("builder-cancel-generation");
      expect(cancel).toBeEnabled();
      expect(cancel).toHaveAttribute("aria-label", "Cancel generation");
    });

    it("clicking Cancel aborts generation and shows cancelled notice", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
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
    });

    it("user can send another prompt after cancellation", async () => {
      const user = userEvent.setup();
      renderWithProviders(<BuilderWorkspace />);
      await waitForMobileStudio();
      await startHangingGeneration(user);
      await user.click(screen.getByTestId("builder-cancel-generation"));

      await waitFor(() =>
        expect(screen.queryByTestId("builder-cancel-generation")).not.toBeInTheDocument(),
      );

      const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
      await user.type(input, "Build a recovery page");
      expect(screen.getByTestId("builder-send")).toBeEnabled();
    });

    it("shows mobile error banner when generation fails", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.orchestrationMode", "pro");
      localStorage.setItem("builder_mistral_api_key_1", "sk-test");
      const { builderChat } = getServerFnMocks();
      builderChat.mockReset();
      builderChat.mockResolvedValue({ ok: false, message: "planner boom" });

      renderWithProviders(<BuilderWorkspace />);
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
    });

    it("user can send another prompt after failed generation", async () => {
      const user = userEvent.setup();
      localStorage.setItem("visual-html.builder.orchestrationMode", "pro");
      localStorage.setItem("builder_mistral_api_key_1", "sk-test");
      const { builderChat } = getServerFnMocks();
      builderChat.mockReset();
      builderChat.mockResolvedValue({ ok: false, message: "planner boom" });

      renderWithProviders(<BuilderWorkspace />);
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
    });
  });
});
