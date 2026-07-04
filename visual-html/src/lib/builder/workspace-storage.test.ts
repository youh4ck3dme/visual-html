import { afterEach, describe, expect, it, vi } from "vitest";

import * as browserEnv from "@/lib/browser-env";
import {
  readStoredWorkspace,
  WORKSPACE_STORAGE_KEY,
  writeStoredWorkspace,
  type StoredWorkspace,
} from "@/lib/builder/workspace-storage";

const SAMPLE: StoredWorkspace = {
  currentCategory: "portfolios",
  messages: [{ id: "1", sender: "ai", text: "Hello" }],
  generatedCode: "<main>Persisted</main>",
  outputSource: "ai",
  versions: [],
  generationMode: "refine",
};

describe("workspace-storage", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("readStoredWorkspace returns null when localStorage is unavailable (SSR-safe)", () => {
    vi.spyOn(browserEnv, "getLocalStorage").mockReturnValue(null);
    expect(readStoredWorkspace()).toBeNull();
  });

  it("writeStoredWorkspace is a no-op when localStorage is unavailable (SSR-safe)", () => {
    vi.spyOn(browserEnv, "getLocalStorage").mockReturnValue(null);
    expect(() => writeStoredWorkspace(SAMPLE)).not.toThrow();
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull();
  });

  it("round-trips workspace data in the browser", () => {
    writeStoredWorkspace(SAMPLE);
    expect(readStoredWorkspace()).toEqual(SAMPLE);
  });
});
