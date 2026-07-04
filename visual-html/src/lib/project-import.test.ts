import { describe, expect, it } from "vitest";

import { mergeImportedProjects, parseProjectImportFile } from "@/lib/project-import";
import { SAVED_PROJECT_SCHEMA_VERSION } from "@/lib/projects-schema";
import type { SavedProject } from "@/types/project";

const SAMPLE_OPTIONS = {
  outputMode: "static" as const,
  stylingMode: "vanilla-css" as const,
  responsiveness: "adaptive" as const,
  accessibilityLevel: "strict" as const,
};

const SAMPLE_RESULT = {
  html: "<main>Hi</main>",
  css: "main{color:red}",
  javascript: "",
  explanation: "Demo",
  accessibilityNotes: "",
  responsiveNotes: "",
  assumptions: [],
  warnings: [],
};

function makeProject(id: string, name: string): SavedProject {
  return {
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
    id,
    name,
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-03T10:00:00.000Z",
    fileName: `${id}.png`,
    imageWidth: 1200,
    imageHeight: 800,
    thumbnailDataUrl: "data:image/jpeg;base64,abc",
    options: SAMPLE_OPTIONS,
    result: SAMPLE_RESULT,
  };
}

describe("project-import", () => {
  it("parseProjectImportFile — accepts a single project object", () => {
    const project = makeProject("p1", "Landing");
    expect(parseProjectImportFile(project)).toEqual([project]);
  });

  it("parseProjectImportFile — accepts an array of projects", () => {
    const projects = [makeProject("p1", "A"), makeProject("p2", "B")];
    expect(parseProjectImportFile(projects)).toEqual(projects);
  });

  it("parseProjectImportFile — rejects invalid payloads", () => {
    expect(parseProjectImportFile({ bad: true })).toEqual([]);
    expect(parseProjectImportFile(null)).toEqual([]);
  });

  it("mergeImportedProjects — upserts by id and refreshes updatedAt", () => {
    const existing = [makeProject("p1", "Old name")];
    const imported = [makeProject("p1", "New name"), makeProject("p2", "Second")];

    const merged = mergeImportedProjects(existing, imported);
    expect(merged).toHaveLength(2);
    expect(merged.find((p) => p.id === "p1")?.name).toBe("New name");
    expect(merged.find((p) => p.id === "p2")?.name).toBe("Second");
    expect(merged.every((p) => p.updatedAt === merged[0]?.updatedAt)).toBe(true);
  });
});