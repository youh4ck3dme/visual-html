import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2, Wand2, ZoomIn } from "lucide-react";
import { useState } from "react";

import { ImageLightbox } from "@/components/pngto/image-lightbox";
import { ResultTabs } from "@/components/pngto/result-tabs";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";
import { formatProjectDate, projectSummaryStats } from "@/lib/projects-store";
import { cn } from "@/lib/utils";
import type { GenerationOptions } from "@/types/generation";

const projectDetailRouteApi = getRouteApi("/projects/$projectId");

const OUTPUT_LABEL_KEYS: Record<GenerationOptions["outputMode"], MessageKey> = {
  static: "options.output.static",
  "single-file": "options.output.singleFile",
  tailwind: "options.output.tailwind",
  component: "options.output.component",
};

const STYLING_LABEL_KEYS: Record<GenerationOptions["stylingMode"], MessageKey> = {
  "vanilla-css": "options.styling.vanillaCss",
  "css-modules": "options.styling.cssModules",
  tailwind: "options.styling.tailwind",
  "inline-css": "options.styling.inlineCss",
};

export function ProjectDetailPage() {
  const { t } = useT();
  const { projectId } = projectDetailRouteApi.useParams();
  const navigate = useNavigate();
  const { getProject, renameProject, deleteProject } = useProjects();
  const project = getProject(projectId);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(project?.name ?? "");
  const [thumbLightboxOpen, setThumbLightboxOpen] = useState(false);

  if (!project) {
    return (
      <div className="visual-shell min-h-dvh">
        <VisualSidebar />
        <div className="min-h-dvh pb-[4.5rem] md:pl-16 md:pb-0">
          <TopCreditBar />
          <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <section className="shell-card p-8 text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {t("projectDetail.notFound.title")}
              </h1>
              <p className="mt-2 text-sm text-shell-muted">
                {t("projectDetail.notFound.description")}
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link to="/projects" data-testid="back-to-projects">
                  {t("projectDetail.backToProjects")}
                </Link>
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
    if (next && next !== project.name) {
      void renameProject(project.id, next).then((ok) => {
        if (!ok) {
          setNameDraft(project.name);
          setEditingName(false);
          return;
        }
        setEditingName(false);
      });
      return;
    }
    setEditingName(false);
  };

  const handleDelete = () => {
    if (!window.confirm(t("projectDetail.deleteConfirm", { name: project.name }))) return;
    void deleteProject(project.id).then((ok) => {
      if (!ok) return;
      void navigate({ to: "/projects" });
    });
  };

  const outputLabel = t(OUTPUT_LABEL_KEYS[project.options.outputMode]);
  const stylingLabel = t(STYLING_LABEL_KEYS[project.options.stylingMode]);

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
                {t("projectDetail.allProjects")}
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
                    aria-label={t("projectDetail.nameAria")}
                    className="h-9"
                  />
                  <Button type="submit" size="sm" data-testid="rename-save">
                    {t("projectDetail.save")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNameDraft(project.name);
                      setEditingName(false);
                    }}
                    data-testid="rename-cancel"
                  >
                    {t("projectDetail.cancel")}
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
                    aria-label={t("projectDetail.renameAria")}
                    data-testid="rename-project"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              )}

              <p className="mt-1 text-sm text-shell-muted">
                {t("projectDetail.meta", {
                  fileName: project.fileName,
                  width: project.imageWidth,
                  height: project.imageHeight,
                  date: formatProjectDate(project.updatedAt),
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/" search={{ project: project.id }} data-testid="open-in-editor">
                  <Wand2 className="h-4 w-4" aria-hidden />
                  {t("projectDetail.openInEditor")}
                </Link>
              </Button>
              <Button variant="outline" onClick={handleDelete} data-testid="delete-project">
                <Trash2 className="h-4 w-4" aria-hidden />
                {t("projectDetail.delete")}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="shell-card overflow-hidden">
              <button
                type="button"
                onClick={() => setThumbLightboxOpen(true)}
                title={t("projectDetail.zoomTitle")}
                aria-label={t("projectDetail.zoomAria", { fileName: project.fileName })}
                className={cn(
                  "group/thumb relative block w-full overflow-hidden outline-none",
                  "transition-transform duration-200 motion-safe:hover:scale-[1.02]",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                )}
              >
                <img
                  src={project.thumbnailDataUrl}
                  alt={t("projectDetail.thumbAlt")}
                  className="aspect-[4/3] w-full object-cover object-top"
                />
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors",
                    "motion-safe:group-hover/thumb:bg-black/35",
                  )}
                  aria-hidden
                >
                  <ZoomIn
                    className={cn(
                      "h-8 w-8 text-white opacity-0 drop-shadow-md transition-opacity",
                      "motion-safe:group-hover/thumb:opacity-100",
                    )}
                  />
                </span>
              </button>
              <div className="space-y-2 p-4 text-xs text-shell-muted">
                <p>
                  <span className="font-medium text-foreground">{t("projectDetail.output")}</span>{" "}
                  {outputLabel}
                </p>
                <p>
                  <span className="font-medium text-foreground">{t("projectDetail.styling")}</span>{" "}
                  {stylingLabel}
                </p>
                <p>
                  <span className="font-medium text-foreground">{t("projectDetail.lines")}</span>{" "}
                  {stats.jsLines > 0
                    ? t("projectDetail.linesWithJs", {
                        htmlLines: stats.htmlLines,
                        cssLines: stats.cssLines,
                        jsLines: stats.jsLines,
                      })
                    : t("projectDetail.linesDetail", {
                        htmlLines: stats.htmlLines,
                        cssLines: stats.cssLines,
                      })}
                </p>
                <p>
                  <span className="font-medium text-foreground">{t("projectDetail.created")}</span>{" "}
                  {formatProjectDate(project.createdAt)}
                </p>
              </div>
            </aside>

            <section className="shell-card p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                {t("projectDetail.generatedOutput")}
              </h2>
              <ResultTabs result={project.result} />
            </section>
          </div>
        </main>
      </div>

      <ImageLightbox
        open={thumbLightboxOpen}
        onClose={() => setThumbLightboxOpen(false)}
        src={project.thumbnailDataUrl}
        alt={t("projectDetail.lightboxAlt")}
        fileName={project.fileName}
        width={project.imageWidth}
        height={project.imageHeight}
      />
    </div>
  );
}