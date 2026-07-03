import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ProjectCard, ProjectsStorageHint } from "@/components/pngto/project-card";
import { ProjectsToolbar } from "@/components/pngto/projects-toolbar";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { filterProjects, sortProjects } from "@/lib/projects-store";
import type { ProjectSort } from "@/types/project";

export const Route = createFileRoute("/projects")({
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

export function ProjectsPage() {
  const { projects, storageBytes } = useProjects();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProjectSort>("updated");

  const visible = useMemo(
    () => sortProjects(filterProjects(projects, query), sort),
    [projects, query, sort],
  );

  return (
    <div className="visual-shell min-h-dvh">
      <VisualSidebar />

      <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />

        <main className="mx-auto max-w-5xl px-4 py-6 pb-8 sm:px-6 sm:py-10 sm:pb-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Projects</h1>
              <p className="mt-1 text-sm text-shell-muted">
                Your saved screenshot-to-HTML generations in this browser.
              </p>
              {projects.length > 0 && (
                <div className="mt-2">
                  <ProjectsStorageHint count={projects.length} bytes={storageBytes} />
                </div>
              )}
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
              <Link to="/">
                <Plus className="h-4 w-4" aria-hidden />
                New project
              </Link>
            </Button>
          </div>

          {projects.length > 0 && (
            <div className="mb-6">
              <ProjectsToolbar
                query={query}
                sort={sort}
                onQueryChange={setQuery}
                onSortChange={setSort}
              />
            </div>
          )}

          {projects.length === 0 ? (
            <section className="shell-card flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-info/15 text-info">
                <FolderKanban className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="text-sm font-medium text-foreground">No projects yet</h2>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-shell-muted">
                Upload a screenshot on New and generate HTML — each successful run is saved here
                automatically.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/">Create first project</Link>
              </Button>
            </section>
          ) : visible.length === 0 ? (
            <section className="shell-card px-6 py-12 text-center">
              <p className="text-sm text-shell-muted">No projects match “{query}”.</p>
            </section>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
