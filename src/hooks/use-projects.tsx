import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createThumbnailDataUrl,
  deleteProjectById,
  estimateProjectsBytes,
  loadProjectsFromStorage,
  renameProjectById,
  saveProjectsToStorage,
  upsertProject,
} from "@/lib/projects-store";
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
  const [projects, setProjects] = useState<SavedProject[]>([]);

  const refresh = useCallback(() => {
    setProjects(loadProjectsFromStorage());
  }, []);

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
    (id: string, name: string) => persist(renameProjectById(projects, id, name)),
    [persist, projects],
  );

  const deleteProject = useCallback(
    (id: string) => persist(deleteProjectById(projects, id)),
    [persist, projects],
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
