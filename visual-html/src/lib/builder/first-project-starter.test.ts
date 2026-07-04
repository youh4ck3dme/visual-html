import { describe, expect, it } from "vitest";

import {
  FIRST_PROJECT_STARTER_TEMPLATE_ID,
  builderTemplateSearch,
  parseBuilderTemplateSearch,
} from "@/lib/builder/first-project-starter";

describe("first-project-starter", () => {
  it("uses Photographer Lightbox as default starter", () => {
    expect(FIRST_PROJECT_STARTER_TEMPLATE_ID).toBe("photo-portfolio");
  });

  it("parseBuilderTemplateSearch accepts known template ids", () => {
    expect(parseBuilderTemplateSearch({ template: "photo-portfolio" })).toEqual({
      template: "photo-portfolio",
    });
    expect(parseBuilderTemplateSearch({ template: "snake-game" })).toEqual({
      template: "snake-game",
    });
  });

  it("parseBuilderTemplateSearch drops unknown or empty values", () => {
    expect(parseBuilderTemplateSearch({ template: "not-a-template" })).toEqual({});
    expect(parseBuilderTemplateSearch({ template: "" })).toEqual({});
    expect(parseBuilderTemplateSearch({ template: 42 })).toEqual({});
    expect(parseBuilderTemplateSearch({})).toEqual({});
  });

  it("builderTemplateSearch mirrors validation", () => {
    expect(builderTemplateSearch("photo-portfolio")).toEqual({ template: "photo-portfolio" });
    expect(builderTemplateSearch("unknown")).toEqual({});
  });
});