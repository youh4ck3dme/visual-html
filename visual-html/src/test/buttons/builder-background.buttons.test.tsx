import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { useBuilderWorkspace } from "@/hooks/use-builder-workspace-consumer";
import { WORKSPACE_STORAGE_KEY } from "@/lib/builder/workspace-storage";
import { getServerFnMocks } from "@/test/mocks/server-fns";
import { renderWithProviders } from "@/test/test-utils";

function GenerationStarter() {
  const { handleSendPrompt } = useBuilderWorkspace();
  return (
    <button type="button" onClick={() => void handleSendPrompt("Build a background test page")}>
      Start background generation
    </button>
  );
}

describe("buttons › builder-background", () => {
  it("shows VibeCraft nav badge while generation runs off-builder", async () => {
    const user = userEvent.setup();
    const { builderChat } = getServerFnMocks();
    builderChat.mockReset();
    builderChat.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(
      <>
        <GenerationStarter />
        <VisualSidebar />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /Start background generation/i }));
    await waitFor(() =>
      expect(screen.getAllByTestId("nav-builder-generating-badge").length).toBeGreaterThan(0),
    );
  });

  it("persists generated HTML when completion happens off-builder", async () => {
    const user = userEvent.setup();
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    const { builderChat } = getServerFnMocks();
    builderChat.mockReset();
    builderChat.mockResolvedValue({
      ok: true,
      content:
        "<!DOCTYPE html><html><head><title>Bg</title></head><body><main>Background OK</main></body></html>",
    });

    renderWithProviders(
      <>
        <GenerationStarter />
        <VisualSidebar />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /Start background generation/i }));
    await waitFor(() =>
      expect(screen.getByText(/VibeCraft generation finished/i)).toBeInTheDocument(),
    );

    const stored = JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY) || "{}") as {
      generatedCode?: string;
    };
    expect(stored.generatedCode).toContain("Background OK");
  });
});
