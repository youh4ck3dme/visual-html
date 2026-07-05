import { createFileRoute } from "@tanstack/react-router";

import { ProjectsPage } from "@/pages/projects-page";

export const Route = createFileRoute("/_editor/projects")({
  head: () => ({
    meta: [
      { title: "Projects — PNGtoHTMLapp" },
      {
        name: "description",
        content: "Browse and manage your screenshot-to-HTML generation projects.",
      },
    ],
  }),
  component: ProjectsPage,
});
