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
  loadProjectsFromStorageWithMeta,
  renameProjectById,
  upsertProject,
} from "@/lib/projects-store";
import {
  getStorageStatus,
  listProjects,
  saveProjects,
  type ProjectsStorageStatus,
} from "@/lib/projects-storage";
import {
  shouldPreferIndexedDbBackend,
  shouldShowFallbackInfoToast,
  shouldShowMigrationPersistWarning,
} from "@/lib/projects-storage-session";
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
  storageStatus: ProjectsStorageStatus;
  /** @deprecated Use storageStatus.approximateBytes */
  storageBytes: number;
  getProject: (id: string) => SavedProject | undefined;
  saveFromGeneration: (input: SaveFromGenerationInput) => Promise<string | null>;
  renameProject: (id: string, name: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function getInitialProjectsState(): {
  projects: SavedProject[];
  backend: ProjectsStorageStatus["backend"];
} {
  if (shouldPreferIndexedDbBackend()) {
    return { projects: [], backend: "indexedDB" };
  }
  const { projects } = loadProjectsFromStorageWithMeta();
  return { projects, backend: "localStorage" };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { t } = useT();
  const [initial] = useState(getInitialProjectsState);
  const [projects, setProjects] = useState<SavedProject[]>(initial.projects);
  const [storageStatus, setStorageStatus] = useState<ProjectsStorageStatus>(() =>
    getStorageStatus(initial.projects, initial.backend),
  );

  const notifyPersistFailed = useCallback(() => {
    toast.error(t("projects.persistFailed.title"), {
      description: t("projects.persistFailed.description"),
      duration: 8000,
    });
  }, [t]);

  const notifyFallbackActivated = useCallback(() => {
    toast.info(t("projects.fallbackActivated.title"), {
      description: t("projects.fallbackActivated.description"),
      duration: 8000,
    });
  }, [t]);

  const handleStorageSideEffects = useCallback(
    (result: {
      migrationPersistFailed: boolean;
      fallbackActivated: boolean;
      backend: ProjectsStorageStatus["backend"];
    }) => {
      if (result.fallbackActivated && shouldShowFallbackInfoToast()) {
        notifyFallbackActivated();
      }
      if (result.migrationPersistFailed && shouldShowMigrationPersistWarning()) {
        toast.warning(t("projects.migrationPersistFailed.title"), {
          description: t("projects.migrationPersistFailed.description"),
          duration: 8000,
        });
      }
    },
    [notifyFallbackActivated, t],
  );

  const refresh = useCallback(async () => {
    const result = await listProjects();
    setProjects(result.projects);
    setStorageStatus(getStorageStatus(result.projects, result.backend));
    handleStorageSideEffects(result);
  }, [handleStorageSideEffects]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (next: SavedProject[]) => {
      const result = await saveProjects(next);
      if (result.ok) {
        setProjects(next);
        setStorageStatus(getStorageStatus(next, result.backend));
        if (result.fallbackActivated && shouldShowFallbackInfoToast()) {
          notifyFallbackActivated();
        }
      }
      return result.ok;
    },
    [notifyFallbackActivated],
  );

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
        if (!(await persist(next))) return null;
        return input.projectId ?? next[0]?.id ?? null;
      } catch {
        return null;
      }
    },
    [persist, projects],
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const ok = await persist(renameProjectById(projects, id, name));
      if (!ok) notifyPersistFailed();
      return ok;
    },
    [notifyPersistFailed, persist, projects],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const ok = await persist(deleteProjectById(projects, id));
      if (!ok) notifyPersistFailed();
      return ok;
    },
    [notifyPersistFailed, persist, projects],
  );

  const value = useMemo(
    () => ({
      projects,
      storageStatus,
      storageBytes: storageStatus.approximateBytes,
      getProject,
      saveFromGeneration,
      renameProject,
      deleteProject,
      refresh,
    }),
    [
      projects,
      storageStatus,
      getProject,
      saveFromGeneration,
      renameProject,
      deleteProject,
      refresh,
    ],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
