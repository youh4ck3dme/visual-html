"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FolderKanban, Pencil, Plus, Trash2, Wand2, ZoomIn } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EditorChatPanel } from "@/components/editor/editor-chat-panel";
import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorPreviewStage } from "@/components/editor/editor-preview-stage";
import { ProjectCard, ProjectsStorageHint } from "@/components/pngto/project-card";
import { ProjectsToolbar } from "@/components/pngto/projects-toolbar";
import { TopCreditBar } from "@/components/pngto/home-workspace";
import { ImageLightbox } from "@/components/pngto/image-lightbox";
import { ResultTabs } from "@/components/pngto/result-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { useT } from "@/hooks/use-t";
import {
  FIRST_PROJECT_STARTER_TEMPLATE_ID,
  builderTemplateSearch,
} from "@/lib/builder/first-project-starter";
import type { MessageKey } from "@/lib/i18n/messages";
import {
  filterProjects,
  formatProjectDate,
  projectSummaryStats,
  sortProjects,
} from "@/lib/projects-store";
import type { GenerationOptions } from "@/types/generation";
import type { ProjectSort } from "@/types/project";

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

type EditorModeProjectsProps = {
  initialProjectId?: string;
};

export function EditorModeProjects({ initialProjectId }: EditorModeProjectsProps) {
  const { t } = useT();
  const navigate = useNavigate();
  const {
    projects,
    isHydrated,
    storageBytes,
    storageStatus,
    getProject,
    renameProject,
    deleteProject,
  } = useProjects();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProjectSort>("updated");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId ?? null,
  );
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [thumbLightboxOpen, setThumbLightboxOpen] = useState(false);

  useEffect(() => {
    if (initialProjectId) setSelectedProjectId(initialProjectId);
  }, [initialProjectId]);

  const visible = useMemo(
    () => sortProjects(filterProjects(projects, query), sort),
    [projects, query, sort],
  );

  const project = selectedProjectId ? getProject(selectedProjectId) : null;

  useEffect(() => {
    if (project) setNameDraft(project.name);
  }, [project]);

  const commitRename = () => {
    if (!project) return;
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
    if (!project) return;
    if (!window.confirm(t("projectDetail.deleteConfirm", { name: project.name }))) return;
    void deleteProject(project.id).then((ok) => {
      if (!ok) return;
      setSelectedProjectId(null);
      void navigate({ to: "/projects" });
    });
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    void navigate({ to: "/projects/$projectId", params: { projectId } });
  };

  const chatPanel = (
    <EditorChatPanel
      header={
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold">{t("projects.title")}</h1>
              <p className="text-xs text-[var(--editor-muted)]">{t("projects.subtitle")}</p>
            </div>
            <Button asChild size="sm" data-testid="new-project">
              <Link to="/">
                <Plus className="h-4 w-4" />
                {t("projects.newProject")}
              </Link>
            </Button>
          </div>
          {projects.length > 0 && (
            <>
              <ProjectsStorageHint
                count={projects.length}
                bytes={storageBytes}
                backend={storageStatus.backend}
                fallbackActive={storageStatus.fallbackActive}
              />
              <ProjectsToolbar
                query={query}
                sort={sort}
                onQueryChange={setQuery}
                onSortChange={setSort}
              />
            </>
          )}
        </div>
      }
    >
      {projects.length === 0 ? (
        <section className="flex flex-col items-center py-12 text-center">
          <FolderKanban className="mb-3 h-8 w-8 text-info" />
          <h2 className="text-sm font-medium">{t("projects.empty.title")}</h2>
          <p className="mt-2 max-w-sm text-xs text-[var(--editor-muted)]">
            {t("projects.empty.description")}
          </p>
          <Button asChild variant="outline" className="mt-4" data-testid="create-first-project">
            <Link to="/builder" search={builderTemplateSearch(FIRST_PROJECT_STARTER_TEMPLATE_ID)}>
              {t("projects.empty.cta")}
            </Link>
          </Button>
        </section>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--editor-muted)]">
          {t("projects.noMatch", { query })}
        </p>
      ) : (
        <div className="grid gap-2">
          {visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              compact
              selected={p.id === selectedProjectId}
              onSelect={handleSelectProject}
            />
          ))}
        </div>
      )}
    </EditorChatPanel>
  );

  const previewPanel = (
    <EditorPreviewStage>
      {!project ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-[var(--editor-muted)]">
          {initialProjectId != null && isHydrated && !getProject(initialProjectId) ? (
            <>
              <p className="text-sm font-semibold text-[var(--editor-fg)]">
                {t("projectDetail.notFound.title")}
              </p>
              <p className="max-w-xs text-xs">{t("projectDetail.notFound.description")}</p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/projects" data-testid="back-to-projects">
                  {t("projectDetail.backToProjects")}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[var(--editor-fg)]">
                {t("editor.projects.selectTitle")}
              </p>
              <p className="max-w-xs text-xs">{t("editor.projects.selectHint")}</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                to="/projects"
                className="mb-2 inline-flex items-center gap-1 text-xs text-[var(--editor-muted)] hover:text-[var(--editor-fg)]"
                data-testid="back-to-projects"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
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
                    className="h-9"
                    aria-label={t("projectDetail.nameAria")}
                  />
                  <Button type="submit" size="sm" data-testid="rename-save">
                    {t("projectDetail.save")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingName(false)}
                    data-testid="rename-cancel"
                  >
                    {t("projectDetail.cancel")}
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{project.name}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setNameDraft(project.name);
                      setEditingName(true);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-md text-[var(--editor-muted)] hover:bg-[var(--editor-hover)]"
                    data-testid="rename-project"
                    aria-label={t("projectDetail.renameAria")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-[var(--editor-muted)]">
                {t("projectDetail.meta", {
                  fileName: project.fileName,
                  width: project.imageWidth,
                  height: project.imageHeight,
                  date: formatProjectDate(project.updatedAt),
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/" search={{ project: project.id }} data-testid="open-in-editor">
                  <Wand2 className="h-4 w-4" />
                  {t("projectDetail.openInEditor")}
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                data-testid="delete-project"
              >
                <Trash2 className="h-4 w-4" />
                {t("projectDetail.delete")}
              </Button>
            </div>
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
            <button
              type="button"
              onClick={() => setThumbLightboxOpen(true)}
              aria-label={t("projectDetail.zoomAria", { fileName: project.fileName })}
              className="overflow-hidden rounded-lg border border-[var(--editor-border)]"
            >
              <img
                src={project.thumbnailDataUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="flex items-center justify-center gap-1 py-1 text-[10px] text-[var(--editor-muted)]">
                <ZoomIn className="h-3 w-3" />
                {t("projectDetail.zoomTitle")}
              </span>
            </button>
            <div className="space-y-1 text-xs text-[var(--editor-muted)]">
              <p>
                <span className="font-medium text-[var(--editor-fg)]">
                  {t("projectDetail.output")}
                </span>{" "}
                {t(OUTPUT_LABEL_KEYS[project.options.outputMode])}
              </p>
              <p>
                <span className="font-medium text-[var(--editor-fg)]">
                  {t("projectDetail.styling")}
                </span>{" "}
                {t(STYLING_LABEL_KEYS[project.options.stylingMode])}
              </p>
              <p>
                <span className="font-medium text-[var(--editor-fg)]">
                  {t("projectDetail.lines")}
                </span>{" "}
                {(() => {
                  const stats = projectSummaryStats(project.result);
                  return stats.jsLines > 0
                    ? t("projectDetail.linesWithJs", {
                        htmlLines: stats.htmlLines,
                        cssLines: stats.cssLines,
                        jsLines: stats.jsLines,
                      })
                    : t("projectDetail.linesDetail", {
                        htmlLines: stats.htmlLines,
                        cssLines: stats.cssLines,
                      });
                })()}
              </p>
            </div>
          </div>

          <ResultTabs result={project.result} />

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
      )}
    </EditorPreviewStage>
  );

  return (
    <EditorLayout topBar={<TopCreditBar />} chatPanel={chatPanel} previewPanel={previewPanel} />
  );
}
