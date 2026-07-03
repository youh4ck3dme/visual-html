import type { GenerateHtmlResult, GenerationOptions } from "./generation";

export type ProjectSort = "updated" | "created" | "name";

export interface SavedProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailDataUrl: string;
  options: GenerationOptions;
  result: GenerateHtmlResult;
}

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
