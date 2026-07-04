import { getLocalStorage } from "@/lib/browser-env";
import type { GenerationMode, OutputSource, VersionRecord } from "@/types/builder";

export type BuilderChatMessage = { id: string; sender: "user" | "ai"; text: string };

export interface StoredWorkspace {
  currentCategory: string;
  messages: BuilderChatMessage[];
  generatedCode: string;
  outputSource: OutputSource;
  versions: VersionRecord[];
  generationMode: GenerationMode;
}

export const WORKSPACE_STORAGE_KEY = "vibecraft_workspace_v1";

export function readStoredWorkspace(): StoredWorkspace | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredWorkspace>;
    if (!Array.isArray(p.messages)) return null;
    return {
      currentCategory: p.currentCategory || "portfolios",
      messages: p.messages,
      generatedCode: p.generatedCode || "",
      outputSource: p.outputSource || (p.generatedCode ? "demo" : "empty"),
      versions: Array.isArray(p.versions) ? p.versions : [],
      generationMode: p.generationMode || (p.generatedCode ? "refine" : "build"),
    };
  } catch {
    return null;
  }
}

export function writeStoredWorkspace(data: StoredWorkspace): void {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(data));
}
