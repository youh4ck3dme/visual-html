import { clearProjectsIndexedDb } from "@/lib/projects-indexeddb";
import { SAVED_PROJECT_SCHEMA_VERSION } from "@/lib/projects-schema";
import { PROJECTS_STORAGE_KEY, saveProjectsToStorage } from "@/lib/projects-store";
import {
  PROJECTS_BACKEND_MARKER_KEY,
  PROJECTS_FALLBACK_SESSION_KEY,
  resetProjectsStorageWarningsForTests,
} from "@/lib/projects-storage-session";
import type { SavedProject } from "@/types/project";
import { SAMPLE_GENERATE_RESULT, SAMPLE_GENERATION_OPTIONS } from "@/test/mocks/sample-image";

export function makeSavedProject(overrides: Partial<SavedProject> = {}): SavedProject {
  return {
    schemaVersion: overrides.schemaVersion ?? SAVED_PROJECT_SCHEMA_VERSION,
    id: overrides.id ?? "proj-test-1",
    name: overrides.name ?? "Landing page",
    createdAt: overrides.createdAt ?? "2026-07-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-07-03T10:00:00.000Z",
    fileName: overrides.fileName ?? "landing.png",
    imageWidth: overrides.imageWidth ?? 1200,
    imageHeight: overrides.imageHeight ?? 800,
    thumbnailDataUrl:
      overrides.thumbnailDataUrl ??
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    options: overrides.options ?? SAMPLE_GENERATION_OPTIONS,
    result: overrides.result ?? SAMPLE_GENERATE_RESULT,
    ...overrides,
  };
}

export function seedProjectsStorage(projects: SavedProject[] = [makeSavedProject()]) {
  saveProjectsToStorage(projects);
  return projects;
}

export function clearProjectsStorage() {
  localStorage.removeItem(PROJECTS_STORAGE_KEY);
  localStorage.removeItem(PROJECTS_BACKEND_MARKER_KEY);
  sessionStorage.removeItem(PROJECTS_FALLBACK_SESSION_KEY);
  resetProjectsStorageWarningsForTests();
  void clearProjectsIndexedDb();
}
