import { Link } from "@tanstack/react-router";
import { AlertTriangle, Code2, FileImage } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { formatProjectDate, projectSummaryStats } from "@/lib/projects-store";
import { formatBytes } from "@/lib/utils/download";
import type { SavedProject } from "@/types/project";

export function ProjectCard({ project }: { project: SavedProject }) {
  const { t } = useT();
  const stats = projectSummaryStats(project.result);

  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="shell-card group flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-info/40 hover:shadow-md"
      data-testid={`project-card-${project.id}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-shell-border bg-shell">
        {project.thumbnailDataUrl ? (
          <img
            src={project.thumbnailDataUrl}
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-shell-muted">
            <FileImage className="h-8 w-8" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">{project.name}</h3>
          <p className="mt-0.5 truncate text-xs text-shell-muted">{project.fileName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-shell-muted">
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

        <p className="mt-auto text-[10px] text-shell-subtle">
          {t("projectCard.updated", { date: formatProjectDate(project.updatedAt) })}
        </p>
      </div>
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
