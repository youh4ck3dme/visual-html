import { createFileRoute } from "@tanstack/react-router";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";

type BuilderSearch = {
  importProject?: string;
};

export const Route = createFileRoute("/builder")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
    importProject: typeof search.importProject === "string" ? search.importProject : undefined,
  }),
  head: () => ({
    meta: [
      { title: "VibeCraft Builder — PNGtoHTMLapp" },
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
  const { importProject } = Route.useSearch();
  return (
    <div className="visual-shell flex min-h-dvh flex-col">
      <VisualSidebar />
      <div className="flex min-h-0 flex-1 flex-col pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />
        <BuilderWorkspace importProjectId={importProject} />
      </div>
    </div>
  );
}
