import { describe, expect, it } from "vitest";

import {
  createProjectRecord,
  deleteProjectById,
  deriveProjectName,
  filterProjects,
  parseProjectsJson,
  renameProjectById,
  sortProjects,
  trimProjectsToLimit,
  upsertProject,
} from "@/lib/projects-store";
import type { SavedProject } from "@/types/project";

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

function makeProject(overrides: Partial<SavedProject> = {}): SavedProject {
  return {
    id: overrides.id ?? "p1",
    name: overrides.name ?? "Landing page",
    createdAt: overrides.createdAt ?? "2026-07-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-07-03T10:00:00.000Z",
    fileName: overrides.fileName ?? "landing.png",
    imageWidth: 1200,
    imageHeight: 800,
    thumbnailDataUrl: "data:image/jpeg;base64,abc",
    options: {
      outputMode: "static",
      stylingMode: "vanilla-css",
      responsiveness: "adaptive",
      accessibilityLevel: "strict",
    },
    result: SAMPLE_RESULT,
    ...overrides,
  };
}

describe("projects-store", () => {
  it("derives project name from file name", () => {
    expect(deriveProjectName("dashboard.webp")).toBe("dashboard");
    expect(deriveProjectName("")).toBe("Untitled project");
  });

  it("sorts and filters projects", () => {
    const projects = [
      makeProject({ id: "a", name: "Zebra", updatedAt: "2026-07-01T10:00:00.000Z" }),
      makeProject({ id: "b", name: "Alpha", updatedAt: "2026-07-03T10:00:00.000Z" }),
    ];
    expect(sortProjects(projects, "name").map((p) => p.id)).toEqual(["b", "a"]);
    expect(sortProjects(projects, "updated").map((p) => p.id)).toEqual(["b", "a"]);
    expect(filterProjects(projects, "zeb").map((p) => p.id)).toEqual(["a"]);
  });

  it("upserts, renames, and deletes projects", () => {
    const created = upsertProject([], {
      fileName: "hero.png",
      imageWidth: 100,
      imageHeight: 100,
      thumbnailDataUrl: "thumb",
      options: makeProject().options,
      result: SAMPLE_RESULT,
    });
    expect(created).toHaveLength(1);
    expect(created[0].name).toBe("hero");

    const updated = upsertProject(
      created,
      {
        fileName: "hero.png",
        imageWidth: 100,
        imageHeight: 100,
        thumbnailDataUrl: "thumb2",
        options: makeProject().options,
        result: { ...SAMPLE_RESULT, html: "<main>Updated</main>" },
      },
      created[0].id,
    );
    expect(updated[0].result.html).toContain("Updated");

    const renamed = renameProjectById(updated, created[0].id, "Hero v2");
    expect(renamed[0].name).toBe("Hero v2");

    const deleted = deleteProjectById(renamed, created[0].id);
    expect(deleted).toHaveLength(0);
  });

  it("trims to max project limit", () => {
    const many = Array.from({ length: 45 }, (_, i) =>
      createProjectRecord({
        fileName: `file-${i}.png`,
        imageWidth: 10,
        imageHeight: 10,
        thumbnailDataUrl: "t",
        options: makeProject().options,
        result: SAMPLE_RESULT,
      }),
    );
    expect(trimProjectsToLimit(many)).toHaveLength(40);
  });

  it("parses valid JSON and rejects malformed entries", () => {
    const valid = JSON.stringify([makeProject()]);
    expect(parseProjectsJson(valid)).toHaveLength(1);
    expect(parseProjectsJson(JSON.stringify([{ id: "x" }]))).toHaveLength(0);
    expect(parseProjectsJson("not-json")).toHaveLength(0);
  });
});
