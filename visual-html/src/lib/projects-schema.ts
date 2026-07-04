import { z } from "zod";

import { generateOutputSchema, optionsSchema } from "@/lib/validation/generation";

export const SAVED_PROJECT_SCHEMA_VERSION = 1 as const;

const DEFAULT_GENERATION_OPTIONS = {
  outputMode: "static" as const,
  stylingMode: "vanilla-css" as const,
  responsiveness: "adaptive" as const,
  accessibilityLevel: "strict" as const,
};

const positiveDimension = z.number().int().positive();

export const savedProjectV1Schema = z.object({
  schemaVersion: z.literal(SAVED_PROJECT_SCHEMA_VERSION),
  id: z.string().min(1),
  name: z.string(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  fileName: z.string().min(1),
  imageWidth: positiveDimension,
  imageHeight: positiveDimension,
  thumbnailDataUrl: z.string().min(1),
  options: optionsSchema,
  result: generateOutputSchema,
});

export type SavedProjectV1 = z.infer<typeof savedProjectV1Schema>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasSchemaVersion(value: Record<string, unknown>): boolean {
  return value.schemaVersion !== undefined && value.schemaVersion !== null;
}

function parseResultField(result: unknown) {
  if (!isRecord(result) || typeof result.html !== "string" || !result.html.trim()) {
    return null;
  }

  const parsed = generateOutputSchema.safeParse(result);
  return parsed.success ? parsed.data : null;
}

function parseOptionsField(options: unknown) {
  const parsed = optionsSchema.safeParse(options);
  if (parsed.success) return parsed.data;

  if (!isRecord(options)) {
    return DEFAULT_GENERATION_OPTIONS;
  }

  const merged = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const fallback = optionsSchema.safeParse(merged);
  return fallback.success ? fallback.data : null;
}

function parseDimension(value: unknown, fallback = 1): number | null {
  const parsed = positiveDimension.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

/** Migrates legacy localStorage entries that predate `schemaVersion`. */
export function migrateUnversionedProject(raw: unknown): SavedProjectV1 | null {
  if (!isRecord(raw) || hasSchemaVersion(raw)) return null;

  if (typeof raw.id !== "string" || !raw.id.trim()) return null;
  if (typeof raw.createdAt !== "string" || !raw.createdAt.trim()) return null;
  if (typeof raw.updatedAt !== "string" || !raw.updatedAt.trim()) return null;
  if (typeof raw.fileName !== "string" || !raw.fileName.trim()) return null;
  if (typeof raw.thumbnailDataUrl !== "string" || !raw.thumbnailDataUrl.trim()) {
    return null;
  }

  const result = parseResultField(raw.result);
  if (!result) return null;

  const options = parseOptionsField(raw.options);
  if (!options) return null;

  const imageWidth = parseDimension(raw.imageWidth);
  const imageHeight = parseDimension(raw.imageHeight);
  if (imageWidth === null || imageHeight === null) return null;

  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name
      : raw.fileName.replace(/\.[^.]+$/, "").trim() || "Untitled project";

  const migrated: SavedProjectV1 = {
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
    id: raw.id,
    name,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    fileName: raw.fileName,
    imageWidth,
    imageHeight,
    thumbnailDataUrl: raw.thumbnailDataUrl,
    options,
    result,
  };

  return savedProjectV1Schema.parse(migrated);
}

export function parseSavedProjectStrict(raw: unknown): SavedProjectV1 | null {
  if (!isRecord(raw)) return null;

  if (raw.schemaVersion === SAVED_PROJECT_SCHEMA_VERSION) {
    const parsed = savedProjectV1Schema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  }

  if (!hasSchemaVersion(raw)) {
    return migrateUnversionedProject(raw);
  }

  return null;
}

export type ParseProjectsResult = {
  projects: SavedProjectV1[];
  migrated: boolean;
};

export function parseProjectsPayload(raw: unknown): ParseProjectsResult {
  if (!Array.isArray(raw)) {
    return { projects: [], migrated: false };
  }

  const projects: SavedProjectV1[] = [];
  let migrated = false;

  for (const entry of raw) {
    const wasUnversioned = isRecord(entry) && !hasSchemaVersion(entry);
    const project = parseSavedProjectStrict(entry);
    if (!project) continue;
    projects.push(project);
    if (wasUnversioned) migrated = true;
  }

  return { projects, migrated };
}

export function parseProjectsJson(raw: string | null): ParseProjectsResult {
  if (!raw) return { projects: [], migrated: false };
  try {
    return parseProjectsPayload(JSON.parse(raw) as unknown);
  } catch {
    return { projects: [], migrated: false };
  }
}
