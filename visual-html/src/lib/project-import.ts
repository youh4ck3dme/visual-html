import { parseSavedProjectStrict } from "@/lib/projects-schema";
import type { SavedProject } from "@/types/project";

export function parseProjectImportFile(raw: unknown): SavedProject[] {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => parseSavedProjectStrict(entry))
      .filter((project): project is SavedProject => project !== null);
  }

  const single = parseSavedProjectStrict(raw);
  return single ? [single] : [];
}

export function mergeImportedProjects(
  existing: SavedProject[],
  imported: SavedProject[],
): SavedProject[] {
  const byId = new Map(existing.map((project) => [project.id, project]));
  const now = new Date().toISOString();

  for (const project of imported) {
    byId.set(project.id, { ...project, updatedAt: now });
  }

  return [...byId.values()];
}