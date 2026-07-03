import { describe, expect, it } from "vitest";

import {
  migrateUnversionedProject,
  parseProjectsJson,
  parseSavedProjectStrict,
  SAVED_PROJECT_SCHEMA_VERSION,
  savedProjectV1Schema,
} from "@/lib/projects-schema";

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

const SAMPLE_OPTIONS = {
  outputMode: "static" as const,
  stylingMode: "vanilla-css" as const,
  responsiveness: "adaptive" as const,
  accessibilityLevel: "strict" as const,
};

function makeV1Project(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
    id: "p1",
    name: "Landing page",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-03T10:00:00.000Z",
    fileName: "landing.png",
    imageWidth: 1200,
    imageHeight: 800,
    thumbnailDataUrl: "data:image/jpeg;base64,abc",
    options: SAMPLE_OPTIONS,
    result: SAMPLE_RESULT,
    ...overrides,
  };
}

function makeLegacyProject(overrides: Record<string, unknown> = {}) {
  return {
    id: "legacy-1",
    name: "Legacy page",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-02T10:00:00.000Z",
    fileName: "legacy.png",
    thumbnailDataUrl: "data:image/jpeg;base64,legacy",
    result: { html: "<main>Legacy</main>" },
    ...overrides,
  };
}

describe("projects-schema", () => {
  it("accepts a fully valid v1 project", () => {
    const project = makeV1Project();
    expect(savedProjectV1Schema.safeParse(project).success).toBe(true);
    expect(parseSavedProjectStrict(project)?.id).toBe("p1");
  });

  it("rejects v1 projects with missing required fields", () => {
    const { imageWidth: _w, ...withoutWidth } = makeV1Project();
    expect(parseSavedProjectStrict(withoutWidth)).toBeNull();

    const invalidOptions = makeV1Project({
      options: { ...SAMPLE_OPTIONS, outputMode: "invalid-mode" },
    });
    expect(parseSavedProjectStrict(invalidOptions)).toBeNull();
  });

  it("rejects unknown schema versions", () => {
    expect(parseSavedProjectStrict(makeV1Project({ schemaVersion: 99 }))).toBeNull();
  });

  it("migrates unversioned projects with defaults for missing fields", () => {
    const migrated = migrateUnversionedProject(makeLegacyProject());
    expect(migrated).toMatchObject({
      schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
      id: "legacy-1",
      imageWidth: 1,
      imageHeight: 1,
      options: SAMPLE_OPTIONS,
      result: {
        html: "<main>Legacy</main>",
        css: "",
        javascript: "",
        explanation: "",
      },
    });
  });

  it("migrates unversioned projects that already include dimensions and options", () => {
    const migrated = migrateUnversionedProject(
      makeLegacyProject({
        imageWidth: 640,
        imageHeight: 480,
        options: {
          ...SAMPLE_OPTIONS,
          outputMode: "tailwind",
          additionalInstructions: "Keep spacing tight",
        },
        result: SAMPLE_RESULT,
      }),
    );
    expect(migrated?.imageWidth).toBe(640);
    expect(migrated?.options.outputMode).toBe("tailwind");
    expect(migrated?.options.additionalInstructions).toBe("Keep spacing tight");
  });

  it("derives project name from file name when legacy name is empty", () => {
    const migrated = migrateUnversionedProject(makeLegacyProject({ name: "   " }));
    expect(migrated?.name).toBe("legacy");
  });

  it("rejects legacy entries without html result", () => {
    expect(migrateUnversionedProject(makeLegacyProject({ result: { css: "x" } }))).toBeNull();
    expect(migrateUnversionedProject(makeLegacyProject({ result: null }))).toBeNull();
  });

  it("parses mixed payloads and flags migration", () => {
    const payload = JSON.stringify([
      makeV1Project({ id: "v1" }),
      makeLegacyProject({ id: "legacy-2" }),
      { id: "broken" },
    ]);
    const { projects, migrated } = parseProjectsJson(payload);
    expect(projects.map((p) => p.id)).toEqual(["v1", "legacy-2"]);
    expect(migrated).toBe(true);
  });

  it("returns empty results for invalid JSON payloads", () => {
    expect(parseProjectsJson(null)).toEqual({ projects: [], migrated: false });
    expect(parseProjectsJson("not-json")).toEqual({ projects: [], migrated: false });
    expect(parseProjectsJson(JSON.stringify({ id: "not-array" }))).toEqual({
      projects: [],
      migrated: false,
    });
  });
});
