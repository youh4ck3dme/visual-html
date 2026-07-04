import { createFileRoute } from "@tanstack/react-router";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";

export const Route = createFileRoute("/builder")({
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
  return (
    <div className="visual-shell flex min-h-dvh flex-col">
      <VisualSidebar />
      <div className="flex min-h-0 flex-1 flex-col pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />
        <BuilderWorkspace />
      </div>
    </div>
  );
}
