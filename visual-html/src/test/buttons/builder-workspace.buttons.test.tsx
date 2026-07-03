import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { promptCategories, promptLibrary } from "@/lib/builder/prompt-library";
import * as download from "@/lib/utils/download";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/lib/utils/download", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/download")>();
  return { ...actual, downloadTextFile: vi.fn() };
});

describe("buttons › builder-workspace", () => {
  beforeEach(() => {
    localStorage.removeItem("vibecraft_workspace_v1");
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

  it("category Landing Pages — has no starter templates (empty library)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BuilderWorkspace />);
    await user.click(screen.getByRole("button", { name: "Landing Pages" }));
    const templates = screen.getByText("Starter Templates").parentElement!;
    expect(within(templates).queryAllByRole("button")).toHaveLength(0);
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
  });

  it("Send prompt — disabled when input empty", () => {
    renderWithProviders(<BuilderWorkspace />);
    const input = screen.getByPlaceholderText(/Build, refine, fix, or explain/i);
    const form = input.closest("form")!;
    const submit = within(form).getAllByRole("button").at(-1)!;
    expect(submit).toBeDisabled();
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
});
