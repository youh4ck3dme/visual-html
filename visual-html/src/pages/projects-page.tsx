import { Link } from "@tanstack/react-router";
import { FolderKanban, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ProjectCard, ProjectsStorageHint } from "@/components/pngto/project-card";
import { ProjectsToolbar } from "@/components/pngto/projects-toolbar";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { useT } from "@/hooks/use-t";
import {
  FIRST_PROJECT_STARTER_TEMPLATE_ID,
  builderTemplateSearch,
} from "@/lib/builder/first-project-starter";
import { filterProjects, sortProjects } from "@/lib/projects-store";
import type { ProjectSort } from "@/types/project";

export function ProjectsPage() {
  const { t } = useT();
  const { projects, storageBytes, storageStatus } = useProjects();
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
              <h1 className="text-lg font-semibold text-foreground">{t("projects.title")}</h1>
              <p className="mt-1 text-sm text-shell-muted">{t("projects.subtitle")}</p>
              {projects.length > 0 && (
                <div className="mt-2">
                  <ProjectsStorageHint
                    count={projects.length}
                    bytes={storageBytes}
                    backend={storageStatus.backend}
                    fallbackActive={storageStatus.fallbackActive}
                  />
                </div>
              )}
            </div>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
              data-testid="new-project"
            >
              <Link to="/">
                <Plus className="h-4 w-4" aria-hidden />
                {t("projects.newProject")}
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
              <h2 className="text-sm font-medium text-foreground">{t("projects.empty.title")}</h2>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-shell-muted">
                {t("projects.empty.description")}
              </p>
              <Button asChild variant="outline" className="mt-6" data-testid="create-first-project">
                <Link
                  to="/builder"
                  search={builderTemplateSearch(FIRST_PROJECT_STARTER_TEMPLATE_ID)}
                >
                  {t("projects.empty.cta")}
                </Link>
              </Button>
            </section>
          ) : visible.length === 0 ? (
            <section className="shell-card px-6 py-12 text-center">
              <p className="text-sm text-shell-muted">{t("projects.noMatch", { query })}</p>
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
