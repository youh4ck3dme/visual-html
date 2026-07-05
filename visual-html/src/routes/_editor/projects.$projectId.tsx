import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { RoutePendingFallback } from "@/components/app/route-pending-fallback";

const ProjectDetailPage = lazy(() =>
  import("@/pages/project-detail-page").then((m) => ({ default: m.ProjectDetailPage })),
);

function ProjectDetailRoute() {
  return (
    <Suspense fallback={<RoutePendingFallback />}>
      <ProjectDetailPage />
    </Suspense>
  );
}

export const Route = createFileRoute("/_editor/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — PNGtoHTMLapp" },
      {
        name: "description",
        content: "View and edit a saved screenshot-to-HTML project.",
      },
      { property: "og:title", content: "Project — PNGtoHTMLapp" },
      {
        property: "og:description",
        content: "View and edit a saved screenshot-to-HTML project.",
      },
    ],
  }),
  component: ProjectDetailRoute,
});
