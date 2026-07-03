import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";

import { ResultTabs } from "@/components/pngto/result-tabs";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { formatProjectDate, projectSummaryStats } from "@/lib/projects-store";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { getProject, renameProject, deleteProject } = useProjects();
  const project = getProject(projectId);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(project?.name ?? "");

  if (!project) {
    return (
      <div className="visual-shell min-h-dvh">
        <VisualSidebar />
        <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
          <TopCreditBar />
          <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <section className="shell-card p-8 text-center">
              <h1 className="text-lg font-semibold text-foreground">Project not found</h1>
              <p className="mt-2 text-sm text-shell-muted">
                It may have been deleted or never saved to this browser.
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link to="/projects">Back to projects</Link>
              </Button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const stats = projectSummaryStats(project.result);

  const commitRename = () => {
    const next = nameDraft.trim();
    if (next && next !== project.name) renameProject(project.id, next);
    setEditingName(false);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    deleteProject(project.id);
    void navigate({ to: "/projects" });
  };

  return (
    <div className="visual-shell min-h-dvh">
      <VisualSidebar />

      <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
        <TopCreditBar />

        <main className="mx-auto max-w-5xl px-4 py-6 pb-8 sm:px-6 sm:py-10 sm:pb-16">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                to="/projects"
                className="mb-3 inline-flex items-center gap-1.5 text-xs text-shell-muted hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                All projects
              </Link>

              {editingName ? (
                <form
                  className="flex max-w-md items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitRename();
                  }}
                >
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    autoFocus
                    aria-label="Project name"
                    className="h-9"
                  />
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNameDraft(project.name);
                      setEditingName(false);
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-semibold text-foreground">{project.name}</h1>
                  <button
                    type="button"
                    onClick={() => {
                      setNameDraft(project.name);
                      setEditingName(true);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-md text-shell-muted hover:bg-shell-hover hover:text-foreground"
                    aria-label="Rename project"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              )}

              <p className="mt-1 text-sm text-shell-muted">
                {project.fileName} · {project.imageWidth}×{project.imageHeight} · Updated{" "}
                {formatProjectDate(project.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/" search={{ project: project.id }}>
                  <Wand2 className="h-4 w-4" aria-hidden />
                  Open in editor
                </Link>
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="shell-card overflow-hidden">
              <img
                src={project.thumbnailDataUrl}
                alt="Screenshot thumbnail"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="space-y-2 p-4 text-xs text-shell-muted">
                <p>
                  <span className="font-medium text-foreground">Output:</span>{" "}
                  {project.options.outputMode}
                </p>
                <p>
                  <span className="font-medium text-foreground">Styling:</span>{" "}
                  {project.options.stylingMode}
                </p>
                <p>
                  <span className="font-medium text-foreground">Lines:</span> {stats.htmlLines} HTML
                  · {stats.cssLines} CSS
                  {stats.jsLines > 0 ? ` · ${stats.jsLines} JS` : ""}
                </p>
                <p>
                  <span className="font-medium text-foreground">Created:</span>{" "}
                  {formatProjectDate(project.createdAt)}
                </p>
              </div>
            </aside>

            <section className="shell-card p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">Generated output</h2>
              <ResultTabs result={project.result} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
