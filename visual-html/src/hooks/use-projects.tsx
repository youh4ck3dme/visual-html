import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useT } from "@/hooks/use-t";
import {
  createThumbnailDataUrl,
  deleteProjectById,
  estimateProjectsBytes,
  loadProjectsFromStorageWithMeta,
  renameProjectById,
  saveProjectsToStorage,
  upsertProject,
} from "@/lib/projects-store";
import { shouldShowMigrationPersistWarning } from "@/lib/projects-storage-session";
import type { CreateProjectInput, SavedProject } from "@/types/project";
import type { GenerateHtmlResult, GenerationOptions } from "@/types/generation";

type SaveFromGenerationInput = {
  fileName: string;
  imageWidth: number;
  imageHeight: number;
  imageDataUrl: string;
  options: GenerationOptions;
  result: GenerateHtmlResult;
  projectId?: string | null;
};

type ProjectsContextValue = {
  projects: SavedProject[];
  storageBytes: number;
  getProject: (id: string) => SavedProject | undefined;
  saveFromGeneration: (input: SaveFromGenerationInput) => Promise<string | null>;
  renameProject: (id: string, name: string) => boolean;
  deleteProject: (id: string) => boolean;
  refresh: () => void;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { t } = useT();
  const [projects, setProjects] = useState<SavedProject[]>([]);

  const notifyPersistFailed = useCallback(() => {
    toast.error(t("projects.persistFailed.title"), {
      description: t("projects.persistFailed.description"),
      duration: 8000,
    });
  }, [t]);

  const refresh = useCallback(() => {
    const { projects: loaded, migrationPersistFailed } = loadProjectsFromStorageWithMeta();
    setProjects(loaded);
    if (migrationPersistFailed && shouldShowMigrationPersistWarning()) {
      toast.warning(t("projects.migrationPersistFailed.title"), {
        description: t("projects.migrationPersistFailed.description"),
        duration: 8000,
      });
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback((next: SavedProject[]) => {
    const ok = saveProjectsToStorage(next);
    if (ok) setProjects(next);
    return ok;
  }, []);

  const getProject = useCallback((id: string) => projects.find((p) => p.id === id), [projects]);

  const saveFromGeneration = useCallback(
    async (input: SaveFromGenerationInput) => {
      try {
        const thumbnailDataUrl = await createThumbnailDataUrl(input.imageDataUrl);
        const payload: CreateProjectInput = {
          fileName: input.fileName,
          imageWidth: input.imageWidth,
          imageHeight: input.imageHeight,
          thumbnailDataUrl,
          options: input.options,
          result: input.result,
        };
        const next = upsertProject(projects, payload, input.projectId ?? undefined);
        if (!persist(next)) return null;
        return input.projectId ?? next[0]?.id ?? null;
      } catch {
        return null;
      }
    },
    [persist, projects],
  );

  const renameProject = useCallback(
    (id: string, name: string) => {
      const ok = persist(renameProjectById(projects, id, name));
      if (!ok) notifyPersistFailed();
      return ok;
    },
    [notifyPersistFailed, persist, projects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      const ok = persist(deleteProjectById(projects, id));
      if (!ok) notifyPersistFailed();
      return ok;
    },
    [notifyPersistFailed, persist, projects],
  );

  const storageBytes = useMemo(() => estimateProjectsBytes(projects), [projects]);

  const value = useMemo(
    () => ({
      projects,
      storageBytes,
      getProject,
      saveFromGeneration,
      renameProject,
      deleteProject,
      refresh,
    }),
    [projects, storageBytes, getProject, saveFromGeneration, renameProject, deleteProject, refresh],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
