import { createFileRoute } from "@tanstack/react-router";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { parseBuilderTemplateSearch } from "@/lib/builder/first-project-starter";

export const Route = createFileRoute("/_editor/builder")({
  validateSearch: parseBuilderTemplateSearch,
  head: () => ({
    meta: [
      { title: "Studio — PNGtoHTMLapp" },
      {
        name: "description",
        content:
          "Prompt-to-HTML app builder with offline templates, AI generation, sandboxed preview, and revision history.",
      },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const { template } = Route.useSearch();

  return <BuilderWorkspace startTemplateId={template} />;
}
