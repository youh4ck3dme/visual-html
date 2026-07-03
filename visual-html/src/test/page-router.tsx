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
import { LocaleProvider } from "@/hooks/use-locale";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProjectsProvider } from "@/hooks/use-projects";
import { Index } from "@/routes/index";
import { ProjectsPage } from "@/routes/projects";
import { ProjectDetailPage } from "@/routes/projects.$projectId";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
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
            <Toaster />
          </ProjectsProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>,
  );

  return { router, ...view };
}
