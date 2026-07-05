import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { RoutePendingFallback } from "@/components/app/route-pending-fallback";

const ProjectsPage = lazy(() =>
  import("@/pages/projects-page").then((m) => ({ default: m.ProjectsPage })),
);

function ProjectsRoute() {
  return (
    <Suspense fallback={<RoutePendingFallback />}>
      <ProjectsPage />
    </Suspense>
  );
}

export const Route = createFileRoute("/_editor/projects")({
  head: () => ({
    meta: [
      { title: "Projects — PNGtoHTMLapp" },
      {
        name: "description",
        content: "Browse and manage your screenshot-to-HTML generation projects.",
      },
      { property: "og:title", content: "Projects — PNGtoHTMLapp" },
      {
        property: "og:description",
        content: "Browse and manage your screenshot-to-HTML generation projects.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsRoute,
});
