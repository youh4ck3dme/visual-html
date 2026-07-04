import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAVED_PROJECT_SCHEMA_VERSION } from "@/lib/projects-schema";
import {
  PROJECTS_IDB_RECORD_KEY,
  PROJECTS_IDB_STORE,
  writeProjectsToIndexedDb,
} from "@/lib/projects-indexeddb";
import { PROJECTS_STORAGE_KEY, saveProjectsToStorage } from "@/lib/projects-store";
import { listProjects, saveProjects } from "@/lib/projects-storage";
import {
  PROJECTS_BACKEND_MARKER_KEY,
  resetProjectsStorageWarningsForTests,
} from "@/lib/projects-storage-session";
import { setFakeIndexedDbWriteFailure } from "@/test/mocks/fake-indexeddb";
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
    schemaVersion: SAVED_PROJECT_SCHEMA_VERSION,
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

function mockLocalStorageWriteFailure() {
  const originalSetItem = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
    this: Storage,
    key,
    value,
  ) {
    if (key === PROJECTS_STORAGE_KEY) {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    }
    return originalSetItem.call(this, key, value);
  });
}

describe("projects-storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetProjectsStorageWarningsForTests();
    setFakeIndexedDbWriteFailure(false);
  });

  it("uses localStorage when save succeeds", async () => {
    const projects = [makeProject()];
    const result = await saveProjects(projects);
    expect(result.ok).toBe(true);
    expect(result.backend).toBe("localStorage");
    expect(result.fallbackActivated).toBe(false);
    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBeTruthy();
  });

  it("falls back to IndexedDB when localStorage setItem throws", async () => {
    mockLocalStorageWriteFailure();
    const projects = [makeProject({ id: "idb-1" })];

    const result = await saveProjects(projects);
    expect(result.ok).toBe(true);
    expect(result.backend).toBe("indexedDB");
    expect(result.fallbackActivated).toBe(true);
    expect(localStorage.getItem(PROJECTS_BACKEND_MARKER_KEY)).toBe("indexedDB");

    const loaded = await listProjects();
    expect(loaded.projects).toHaveLength(1);
    expect(loaded.projects[0].id).toBe("idb-1");
    expect(loaded.backend).toBe("indexedDB");
  });

  it("reloads IndexedDB projects after fallback activation", async () => {
    mockLocalStorageWriteFailure();
    await saveProjects([makeProject({ id: "reload-1", name: "Reload me" })]);

    const loaded = await listProjects();
    expect(loaded.projects).toHaveLength(1);
    expect(loaded.projects[0].name).toBe("Reload me");
    expect(loaded.backend).toBe("indexedDB");
  });

  it("rejects corrupt IndexedDB records safely", async () => {
    await writeProjectsToIndexedDb([makeProject()]);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("visual-html-projects", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PROJECTS_IDB_STORE, "readwrite");
      tx.objectStore(PROJECTS_IDB_STORE).put(
        JSON.stringify([{ id: "bad", result: { html: "" } }]),
        PROJECTS_IDB_RECORD_KEY,
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();

    localStorage.removeItem(PROJECTS_STORAGE_KEY);
    const loaded = await listProjects();
    expect(loaded.projects).toHaveLength(0);
  });

  it("still migrates legacy localStorage projects", async () => {
    const legacy = {
      id: "legacy-storage-1",
      name: "Old landing",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
      fileName: "old.png",
      thumbnailDataUrl: "data:image/jpeg;base64,abc",
      result: { html: "<main>Legacy</main>" },
    };
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([legacy]));

    const loaded = await listProjects();
    expect(loaded.projects).toHaveLength(1);
    expect(loaded.projects[0].schemaVersion).toBe(SAVED_PROJECT_SCHEMA_VERSION);
    expect(loaded.migrationPersistFailed).toBe(false);
    expect(JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY)!)[0].schemaVersion).toBe(
      SAVED_PROJECT_SCHEMA_VERSION,
    );
  });

  it("reports failure when both localStorage and IndexedDB fail", async () => {
    mockLocalStorageWriteFailure();
    setFakeIndexedDbWriteFailure(true);

    const result = await saveProjects([makeProject()]);
    expect(result.ok).toBe(false);
    expect(result.backend).toBe("unavailable");
  });

  it("loads IndexedDB when localStorage is missing but IndexedDB has projects", async () => {
    await writeProjectsToIndexedDb([makeProject({ id: "orphan-idb" })]);
    const loaded = await listProjects();
    expect(loaded.projects).toHaveLength(1);
    expect(loaded.projects[0].id).toBe("orphan-idb");
    expect(loaded.backend).toBe("indexedDB");
  });

  it("prefers localStorage when both backends have data and fallback is inactive", async () => {
    saveProjectsToStorage([makeProject({ id: "ls-1", name: "From localStorage" })]);
    await writeProjectsToIndexedDb([makeProject({ id: "idb-2", name: "From IndexedDB" })]);

    const loaded = await listProjects();
    expect(loaded.projects).toHaveLength(1);
    expect(loaded.projects[0].id).toBe("ls-1");
    expect(loaded.backend).toBe("localStorage");
  });
});
