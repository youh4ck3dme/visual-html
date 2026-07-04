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

import { Toaster } from "@/components/ui/sonner";
import { BuilderWorkspaceProvider } from "@/hooks/use-builder-workspace";
import { LocaleProvider } from "@/hooks/use-locale";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProjectsProvider } from "@/hooks/use-projects";
import { IndexPage } from "@/pages/index-page";
import { ProjectDetailPage } from "@/pages/project-detail-page";
import { ProjectsPage } from "@/pages/projects-page";

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
  component: IndexPage,
  validateSearch: (search: Record<string, unknown>) => ({
    project: typeof search.project === "string" ? search.project : undefined,
  }),
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsPage,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectDetailPage,
});

const pageRouteTree = rootRoute.addChildren([indexRoute, projectsRoute, projectDetailRoute]);

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
            <RouterProvider router={router} />
          </ProjectsProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>,
  );

  return { router, ...view };
}
