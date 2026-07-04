import { getLocalStorage } from "@/lib/browser-env";
import { parseProjectsJson as parseProjectsJsonPayload } from "@/lib/projects-schema";
import {
  estimateProjectsBytes,
  PROJECTS_STORAGE_KEY,
  saveProjectsToStorage,
} from "@/lib/projects-store";
import { readProjectsFromIndexedDb, writeProjectsToIndexedDb } from "@/lib/projects-indexeddb";
import {
  isProjectsFallbackActive,
  markProjectsFallbackActive,
  shouldPreferIndexedDbBackend,
} from "@/lib/projects-storage-session";
import type { SavedProject } from "@/types/project";

export type ProjectsStorageBackend = "localStorage" | "indexedDB" | "unavailable";

export type ProjectsStorageStatus = {
  backend: ProjectsStorageBackend;
  projectCount: number;
  approximateBytes: number;
  fallbackActive: boolean;
};

export type ListProjectsResult = {
  projects: SavedProject[];
  migrationPersistFailed: boolean;
  backend: ProjectsStorageBackend;
  fallbackActivated: boolean;
};

export type SaveProjectsResult = {
  ok: boolean;
  backend: ProjectsStorageBackend;
  fallbackActivated: boolean;
};

function isLocalStorageMissingOrCorrupt(raw: string | null, projects: SavedProject[]): boolean {
  if (raw === null) return true;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "[]") return false;
  if (projects.length > 0) return false;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return true;
    if (parsed.length === 0) return false;
    return true;
  } catch {
    return true;
  }
}

export function getStorageStatus(
  projects: SavedProject[],
  backend: ProjectsStorageBackend = shouldPreferIndexedDbBackend() ? "indexedDB" : "localStorage",
): ProjectsStorageStatus {
  const fallbackActive = isProjectsFallbackActive() || shouldPreferIndexedDbBackend();
  return {
    backend: backend === "unavailable" ? "unavailable" : backend,
    projectCount: projects.length,
    approximateBytes: estimateProjectsBytes(projects),
    fallbackActive,
  };
}

export async function listProjects(): Promise<ListProjectsResult> {
  if (shouldPreferIndexedDbBackend()) {
    const projects = await readProjectsFromIndexedDb();
    return {
      projects,
      migrationPersistFailed: false,
      backend: "indexedDB",
      fallbackActivated: false,
    };
  }

  const storage = getLocalStorage();
  const raw = storage?.getItem(PROJECTS_STORAGE_KEY) ?? null;
  const { projects, migrated } = parseProjectsJsonPayload(raw);

  if (migrated) {
    const saveResult = await saveProjects(projects);
    return {
      projects,
      migrationPersistFailed: !saveResult.ok,
      backend: saveResult.ok ? saveResult.backend : "unavailable",
      fallbackActivated: saveResult.fallbackActivated,
    };
  }

  if (isLocalStorageMissingOrCorrupt(raw, projects)) {
    const idbProjects = await readProjectsFromIndexedDb();
    if (idbProjects.length > 0) {
      markProjectsFallbackActive();
      return {
        projects: idbProjects,
        migrationPersistFailed: false,
        backend: "indexedDB",
        fallbackActivated: false,
      };
    }
  }

  return {
    projects,
    migrationPersistFailed: false,
    backend: "localStorage",
    fallbackActivated: false,
  };
}

export async function saveProjects(projects: SavedProject[]): Promise<SaveProjectsResult> {
  if (shouldPreferIndexedDbBackend()) {
    const ok = await writeProjectsToIndexedDb(projects);
    return {
      ok,
      backend: ok ? "indexedDB" : "unavailable",
      fallbackActivated: false,
    };
  }

  const storage = getLocalStorage();
  const lsOk = storage ? saveProjectsToStorage(projects, storage) : false;
  if (lsOk) {
    return { ok: true, backend: "localStorage", fallbackActivated: false };
  }

  const idbOk = await writeProjectsToIndexedDb(projects);
  if (idbOk) {
    markProjectsFallbackActive();
    try {
      storage?.removeItem(PROJECTS_STORAGE_KEY);
    } catch {
      // ignore
    }
    return { ok: true, backend: "indexedDB", fallbackActivated: true };
  }

  return { ok: false, backend: "unavailable", fallbackActivated: false };
}
