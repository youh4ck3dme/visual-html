import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

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

export function createLinkRouter(initialPath = "/") {
  const rootRoute = createRootRoute({ component: () => null });
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  return createRouter({ routeTree: rootRoute, history });
}

type WrapperOptions = {
  initialPath?: string;
  withProjects?: boolean;
};

function AllProviders({
  children,
  initialPath = "/",
  withProjects = true,
}: {
  children: ReactNode;
  initialPath?: string;
  withProjects?: boolean;
}) {
  const queryClient = createTestQueryClient();
  const router = createLinkRouter(initialPath);

  const inner = withProjects ? <ProjectsProvider>{children}</ProjectsProvider> : children;

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ThemeProvider>
          <RouterContextProvider router={router}>{inner}</RouterContextProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions & WrapperOptions) {
  const { initialPath, withProjects, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialPath={initialPath} withProjects={withProjects}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}
