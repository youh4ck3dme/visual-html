import { promptLibrary } from "@/lib/builder/prompt-library";

/** Default starter for empty-state “Create first project” on /projects. */
export const FIRST_PROJECT_STARTER_TEMPLATE_ID = "photo-portfolio" as const;

export type BuilderTemplateSearch = {
  template?: string;
};

export function parseBuilderTemplateSearch(search: Record<string, unknown>): BuilderTemplateSearch {
  const raw = typeof search.template === "string" ? search.template.trim() : "";
  if (raw && promptLibrary.some((item) => item.id === raw)) {
    return { template: raw };
  }
  return {};
}

export function builderTemplateSearch(templateId: string): BuilderTemplateSearch {
  if (promptLibrary.some((item) => item.id === templateId)) {
    return { template: templateId };
  }
  return {};
}
