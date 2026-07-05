import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { RoutePendingFallback } from "@/components/app/route-pending-fallback";
import { parseBuilderTemplateSearch } from "@/lib/builder/first-project-starter";

const BuilderWorkspace = lazy(() =>
  import("@/components/builder/builder-workspace").then((m) => ({
    default: m.BuilderWorkspace,
  })),
);

export const Route = createFileRoute("/_editor/builder")({
  validateSearch: parseBuilderTemplateSearch,
  head: () => ({
    meta: [
      { title: "VibeCraft Builder — PNGtoHTMLapp" },
      {
        name: "description",
        content:
          "Prompt-to-HTML app builder with offline templates, AI generation, sandboxed preview, and revision history.",
      },
      { property: "og:title", content: "VibeCraft Builder — PNGtoHTMLapp" },
      {
        property: "og:description",
        content:
          "Prompt-to-HTML app builder with offline templates, AI generation, sandboxed preview, and revision history.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const { template } = Route.useSearch();

  return (
    <Suspense fallback={<RoutePendingFallback />}>
      <BuilderWorkspace startTemplateId={template} />
    </Suspense>
  );
}
