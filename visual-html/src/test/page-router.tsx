import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import { SettingsDialog } from "@/components/app/settings-dialog";
import { SettingsProvider } from "@/components/app/settings-context";
import { EditorModeProjects } from "@/components/editor/editor-mode-projects";
import { EditorModeScreenshot } from "@/components/editor/editor-mode-screenshot";
import { Toaster } from "@/components/ui/sonner";
import { BuilderWorkspaceProvider } from "@/hooks/use-builder-workspace";
import { LocaleProvider } from "@/hooks/use-locale";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProjectsProvider } from "@/hooks/use-projects";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const rootRoute = createRootRoute({
  component: () => (
    <BuilderWorkspaceProvider>
      <Outlet />
      <Toaster />
    </BuilderWorkspaceProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    project: typeof search.project === "string" ? search.project : undefined,
  }),
  component: function IndexTestPage() {
    const { project } = indexRoute.useSearch();
    return <EditorModeScreenshot projectId={project} />;
  },
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: () => <Outlet />,
});

const projectsIndexRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: "/",
  component: () => <EditorModeProjects />,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: "/$projectId",
  component: function ProjectDetailTestPage() {
    const { projectId } = projectDetailRoute.useParams();
    return <EditorModeProjects initialProjectId={projectId} />;
  },
});

const pageRouteTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute.addChildren([projectsIndexRoute, projectDetailRoute]),
]);

export async function renderPageAt(path: string) {
  const queryClient = createTestQueryClient();
  const history = createMemoryHistory({ initialEntries: [path] });
  const router = createRouter({
    routeTree: pageRouteTree,
    history,
    context: { queryClient },
  });
  await router.load();

  const view = render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ThemeProvider>
          <ProjectsProvider>
            <SettingsProvider>
              <RouterProvider router={router} />
              <SettingsDialog />
            </SettingsProvider>
          </ProjectsProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>,
  );

  return { router, ...view };
}
