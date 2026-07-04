import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Toaster } from "@/components/ui/sonner";
import { useBuilderWorkspace } from "@/hooks/use-builder-workspace-consumer";
import { BuilderWorkspaceProvider } from "@/hooks/use-builder-workspace";
import { LocaleProvider } from "@/hooks/use-locale";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProjectsProvider } from "@/hooks/use-projects";
import {
  readStoredWorkspace,
  WORKSPACE_STORAGE_KEY,
  writeStoredWorkspace,
  type StoredWorkspace,
} from "@/lib/builder/workspace-storage";
import { getServerFnMocks } from "@/test/mocks/server-fns";

function GenerationProbe() {
  const { isGenerating, generatedCode, handleCancelGeneration } = useBuilderWorkspace();
  return (
    <div>
      <div data-testid="builder-generating-state">{isGenerating ? "yes" : "no"}</div>
      <div data-testid="builder-generated-code">{generatedCode}</div>
      <button type="button" onClick={handleCancelGeneration} data-testid="probe-cancel-generation">
        Cancel from probe
      </button>
    </div>
  );
}

function ShellLayout() {
  return (
    <>
      <VisualSidebar />
      <Outlet />
      <GenerationProbe />
    </>
  );
}

async function renderBackgroundApp(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const rootRoute = createRootRoute({
    component: () => (
      <BuilderWorkspaceProvider>
        <ShellLayout />
        <Toaster />
      </BuilderWorkspaceProvider>
    ),
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div data-testid="page-home">Home</div>,
  });
  const projectsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects",
    component: () => <div data-testid="page-projects">Projects</div>,
  });
  const builderRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/builder",
    component: BuilderWorkspace,
  });
  const routeTree = rootRoute.addChildren([homeRoute, projectsRoute, builderRoute]);
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createRouter({ routeTree, history, context: { queryClient } });
  await router.load();

  const view = render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ThemeProvider>
          <ProjectsProvider>
            <RouterProvider router={router} />
          </ProjectsProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>,
  );

  return { router, ...view };
}

describe("buttons › builder-background", () => {
  it("keeps generation alive after navigating away from /builder", async () => {
    const user = userEvent.setup();
    const { builderChat } = getServerFnMocks();
    builderChat.mockReset();
    builderChat.mockImplementation(() => new Promise(() => {}));

    await renderBackgroundApp("/builder");
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a route change test page",
    );
    await user.click(screen.getByTestId("builder-send"));

    await waitFor(() =>
      expect(screen.getByTestId("builder-generating-state")).toHaveTextContent("yes"),
    );

    await user.click(screen.getByTestId("nav-projects"));

    await waitFor(() => expect(screen.getByTestId("page-projects")).toBeInTheDocument());
    expect(screen.getByTestId("builder-generating-state")).toHaveTextContent("yes");
    expect(screen.getAllByTestId("nav-builder-generating-badge").length).toBeGreaterThan(0);
  });

  it("shows VibeCraft nav badge while generation runs off-builder", async () => {
    const user = userEvent.setup();
    const { builderChat } = getServerFnMocks();
    builderChat.mockReset();
    builderChat.mockImplementation(() => new Promise(() => {}));

    await renderBackgroundApp("/");
    await user.click(screen.getByTestId("nav-builder"));
    await waitFor(() => expect(screen.getByTestId("builder-send")).toBeInTheDocument());

    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a background badge test page",
    );
    await user.click(screen.getByTestId("builder-send"));
    await user.click(screen.getByTestId("nav-projects"));

    await waitFor(() =>
      expect(screen.getAllByTestId("nav-builder-generating-badge").length).toBeGreaterThan(0),
    );
  });

  it("persists generated HTML and shows completion toast off-builder", async () => {
    const user = userEvent.setup();
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    const { builderChat, builderAiStatus } = getServerFnMocks();
    builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
    builderChat.mockReset();
    builderChat.mockResolvedValue({
      ok: true,
      content:
        "<!DOCTYPE html><html><head><title>Bg</title></head><body><main>Background OK</main></body></html>",
    });

    await renderBackgroundApp("/builder");
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a background persistence page",
    );
    await user.click(screen.getByTestId("builder-send"));
    await user.click(screen.getByTestId("nav-home"));

    await waitFor(() =>
      expect(screen.getByText(/VibeCraft generation finished/i)).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(screen.getByTestId("builder-generated-code")).toHaveTextContent(/Background OK/),
    );
    const stored = readStoredWorkspace();
    expect(stored?.generatedCode).toContain("Background OK");
  });

  it("Open Builder toast action navigates back to /builder", async () => {
    const user = userEvent.setup();
    const { builderChat, builderAiStatus } = getServerFnMocks();
    builderAiStatus.mockResolvedValue({ serverKeysConfigured: true });
    builderChat.mockReset();
    builderChat.mockResolvedValue({
      ok: true,
      content:
        "<!DOCTYPE html><html><head><title>Nav</title></head><body><main>Nav OK</main></body></html>",
    });

    const { router } = await renderBackgroundApp("/builder");
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a toast navigation page",
    );
    await user.click(screen.getByTestId("builder-send"));
    await user.click(screen.getByTestId("nav-projects"));

    await screen.findByText(/VibeCraft generation finished/i);
    await user.click(screen.getByRole("button", { name: /Open Builder/i }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/builder"));
    expect(screen.getByTestId("builder-send")).toBeInTheDocument();
  });

  it("cancel clears generation state and sidebar badge", async () => {
    const user = userEvent.setup();
    const { builderChat } = getServerFnMocks();
    builderChat.mockReset();
    builderChat.mockImplementation(() => new Promise(() => {}));

    await renderBackgroundApp("/builder");
    await user.type(
      screen.getByPlaceholderText(/Build, refine, fix, or explain/i),
      "Build a cancel test page",
    );
    await user.click(screen.getByTestId("builder-send"));
    await user.click(screen.getByTestId("nav-home"));

    await waitFor(() =>
      expect(screen.getByTestId("builder-generating-state")).toHaveTextContent("yes"),
    );
    await user.click(screen.getByTestId("probe-cancel-generation"));

    await waitFor(() =>
      expect(screen.getByTestId("builder-generating-state")).toHaveTextContent("no"),
    );
    expect(screen.queryByTestId("nav-builder-generating-badge")).not.toBeInTheDocument();
  });

  it("hydrates persisted workspace when app reloads", async () => {
    const persisted: StoredWorkspace = {
      currentCategory: "games",
      messages: [{ id: "m1", sender: "ai", text: "Restored workspace" }],
      generatedCode:
        "<!DOCTYPE html><html><head><title>R</title></head><body><main>Reloaded</main></body></html>",
      outputSource: "ai",
      versions: [],
      generationMode: "refine",
    };
    writeStoredWorkspace(persisted);

    await renderBackgroundApp("/builder");

    await waitFor(() =>
      expect(screen.getByTestId("builder-generated-code")).toHaveTextContent(/Reloaded/),
    );
    expect(readStoredWorkspace()?.generatedCode).toContain("Reloaded");
  });
});
