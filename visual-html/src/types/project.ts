import type { SavedProjectV1 } from "@/lib/projects-schema";
import type { GenerateHtmlResult, GenerationOptions } from "./generation";

export { SAVED_PROJECT_SCHEMA_VERSION } from "@/lib/projects-schema";
export type SavedProject = SavedProjectV1;

export type ProjectSort = "updated" | "created" | "name";

export interface CreateProjectInput {
  name?: string;
  fileName: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailDataUrl: string;
  options: GenerationOptions;
  result: GenerateHtmlResult;
}

export interface UpdateProjectInput {
  name?: string;
  options?: GenerationOptions;
  result?: GenerateHtmlResult;
  thumbnailDataUrl?: string;
  fileName?: string;
  imageWidth?: number;
  imageHeight?: number;
}
