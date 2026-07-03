import {
  parseProjectsJson as parseProjectsJsonPayload,
  SAVED_PROJECT_SCHEMA_VERSION,
} from "@/lib/projects-schema";
import type {
  CreateProjectInput,
  ProjectSort,
  SavedProject,
  UpdateProjectInput,
} from "@/types/project";
import type { GenerateHtmlResult, GenerationOptions } from "@/types/generation";

export { SAVED_PROJECT_SCHEMA_VERSION };

export const PROJECTS_STORAGE_KEY = "pngto-projects";
export const MAX_PROJECTS = 40;

export function deriveProjectName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").trim();
  return base || "Untitled project";
}

export function sortProjects(projects: SavedProject[], sort: ProjectSort): SavedProject[] {
  const copy = [...projects];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "created":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "updated":
    default:
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export function filterProjects(projects: SavedProject[], query: string): SavedProject[] {
  const q = query.trim().toLowerCase();
  if (!q) return projects;
  return projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.fileName.toLowerCase().includes(q) ||
      p.result.explanation.toLowerCase().includes(q),
  );
}

export function estimateProjectsBytes(projects: SavedProject[]): number {
  try {
    return new Blob([JSON.stringify(projects)]).size;
  } catch {
    return 0;
  }
}

export function createProjectRecord(
  input: CreateProjectInput,
  id = crypto.randomUUID(),
): SavedProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
    id,
    name: input.name?.trim() || deriveProjectName(input.fileName),
    createdAt: now,
    updatedAt: now,
    fileName: input.fileName,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
    thumbnailDataUrl: input.thumbnailDataUrl,
    options: input.options,
    result: input.result,
  };
}

export function updateProjectRecord(
  project: SavedProject,
  patch: UpdateProjectInput,
): SavedProject {
  return {
    ...project,
    ...patch,
    name: patch.name?.trim() || project.name,
    updatedAt: new Date().toISOString(),
  };
}

export function trimProjectsToLimit(
  projects: SavedProject[],
  limit = MAX_PROJECTS,
): SavedProject[] {
  return sortProjects(projects, "updated").slice(0, limit);
}

export function parseProjectsJson(raw: string | null): SavedProject[] {
  return parseProjectsJsonPayload(raw).projects;
}

export function loadProjectsFromStorage(storage: Storage = localStorage): SavedProject[] {
  const { projects, migrated } = parseProjectsJsonPayload(storage.getItem(PROJECTS_STORAGE_KEY));
  if (migrated) {
    saveProjectsToStorage(projects, storage);
  }
  return projects;
}

export function saveProjectsToStorage(
  projects: SavedProject[],
  storage: Storage = localStorage,
): boolean {
  try {
    storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(trimProjectsToLimit(projects)));
    return true;
  } catch {
    return false;
  }
}

export function upsertProject(
  projects: SavedProject[],
  input: CreateProjectInput,
  existingId?: string,
): SavedProject[] {
  if (existingId) {
    const index = projects.findIndex((p) => p.id === existingId);
    if (index >= 0) {
      const next = [...projects];
      next[index] = updateProjectRecord(projects[index], {
        name: input.name,
        fileName: input.fileName,
        imageWidth: input.imageWidth,
        imageHeight: input.imageHeight,
        thumbnailDataUrl: input.thumbnailDataUrl,
        options: input.options,
        result: input.result,
      });
      return trimProjectsToLimit(next);
    }
  }
  return trimProjectsToLimit([createProjectRecord(input), ...projects]);
}

export function deleteProjectById(projects: SavedProject[], id: string): SavedProject[] {
  return projects.filter((p) => p.id !== id);
}

export function renameProjectById(
  projects: SavedProject[],
  id: string,
  name: string,
): SavedProject[] {
  return projects.map((p) => (p.id === id ? updateProjectRecord(p, { name }) : p));
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

export async function createThumbnailDataUrl(
  dataUrl: string,
  maxSize = 160,
  quality = 0.72,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight, 1));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create thumbnail");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export function projectSummaryStats(result: GenerateHtmlResult) {
  const htmlLines = result.html.split("\n").length;
  const cssLines = result.css.split("\n").length;
  const jsLines = result.javascript ? result.javascript.split("\n").length : 0;
  const warnings = result.warnings.length;
  return { htmlLines, cssLines, jsLines, warnings };
}

export function formatProjectDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type { GenerationOptions, GenerateHtmlResult };
