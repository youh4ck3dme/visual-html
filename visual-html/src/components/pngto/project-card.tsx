import { Link } from "@tanstack/react-router";
import { AlertTriangle, Code2, FileImage } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { formatProjectDate, projectSummaryStats } from "@/lib/projects-store";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/download";
import type { SavedProject } from "@/types/project";

type ProjectCardProps = {
  project: SavedProject;
  /** Compact row for editor split list. */
  compact?: boolean;
  selected?: boolean;
  onSelect?: (projectId: string) => void;
};

export function ProjectCard({
  project,
  compact = false,
  selected = false,
  onSelect,
}: ProjectCardProps) {
  const { t } = useT();
  const stats = projectSummaryStats(project.result);

  const cardClass = cn(
    "group flex overflow-hidden text-left transition-[border-color,box-shadow,background-color] duration-300",
    compact
      ? cn(
          "w-full items-center gap-3 rounded-lg border p-2",
          selected
            ? "border-[var(--editor-accent)] bg-[var(--editor-accent-dim)] ring-1 ring-inset ring-[var(--editor-accent)]/30"
            : "border-[var(--editor-border)] hover:border-info/40 hover:bg-[var(--editor-hover)]",
        )
      : "shell-card flex-col hover:border-info/40 hover:shadow-md",
  );

  const inner = (
    <>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-shell",
          compact
            ? "h-12 w-12 rounded-md border border-[var(--editor-border)]"
            : "aspect-[16/10] border-b border-shell-border",
        )}
      >
        {project.thumbnailDataUrl ? (
          <img
            src={project.thumbnailDataUrl}
            alt=""
            width={compact ? 48 : undefined}
            height={compact ? 48 : undefined}
            loading="lazy"
            decoding="async"
            className={cn(
              "h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-shell-muted">
            <FileImage className={compact ? "h-4 w-4" : "h-8 w-8"} aria-hidden />
          </div>
        )}
      </div>

      <div className={cn("min-w-0 flex-1", compact ? "py-0.5" : "flex flex-col gap-2 p-4")}>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">{project.name}</h3>
          {!compact && (
            <p className="mt-0.5 truncate text-xs text-shell-muted">{project.fileName}</p>
          )}
        </div>

        {!compact && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-shell-muted">
              <span>
                {project.imageWidth}×{project.imageHeight}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Code2 className="h-3 w-3" aria-hidden />
                {t("projectCard.lines", { htmlLines: stats.htmlLines, cssLines: stats.cssLines })}
              </span>
              {stats.warnings > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                    {stats.warnings}
                  </span>
                </>
              )}
            </div>

            <p className="mt-auto text-xs text-shell-subtle">
              {t("projectCard.updated", { date: formatProjectDate(project.updatedAt) })}
            </p>
          </>
        )}

        {compact && (
          <p className="truncate text-[11px] text-[var(--editor-muted)]">
            {t("projectCard.updated", { date: formatProjectDate(project.updatedAt) })}
          </p>
        )}
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(project.id)}
        className={cardClass}
        data-testid={`project-card-${project.id}`}
        aria-current={selected ? "true" : undefined}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className={cardClass}
      data-testid={`project-card-${project.id}`}
    >
      {inner}
    </Link>
  );
}

export function ProjectsStorageHint({
  count,
  bytes,
  backend,
  fallbackActive,
}: {
  count: number;
  bytes: number;
  backend?: "localStorage" | "indexedDB" | "unavailable";
  fallbackActive?: boolean;
}) {
  const { t } = useT();
  const usingIndexedDb = fallbackActive || backend === "indexedDB";
  const storageLabel = usingIndexedDb
    ? t("projects.storageMode.indexedDB")
    : t("projects.storageMode.localStorage");

  return (
    <p className="text-xs text-shell-muted">
      {count === 1
        ? t("projects.storageOne", { size: formatBytes(bytes) })
        : t("projects.storage", { count, size: formatBytes(bytes) })}
      <span aria-hidden> · </span>
      <span className="text-shell-subtle">{storageLabel}</span>
    </p>
  );
}
