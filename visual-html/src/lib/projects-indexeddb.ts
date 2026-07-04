import { parseProjectsPayload } from "@/lib/projects-schema";
import { trimProjectsToLimit } from "@/lib/projects-store";
import type { SavedProject } from "@/types/project";

export const PROJECTS_IDB_NAME = "visual-html-projects";
export const PROJECTS_IDB_STORE = "projects";
export const PROJECTS_IDB_RECORD_KEY = "all";

const DB_VERSION = 1;

function getIndexedDb(): IDBFactory | undefined {
  return typeof indexedDB !== "undefined" ? indexedDB : undefined;
}

export function openProjectsDb(): Promise<IDBDatabase> {
  const idb = getIndexedDb();
  if (!idb) {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }

  return new Promise((resolve, reject) => {
    const request = idb.open(PROJECTS_IDB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS_IDB_STORE)) {
        db.createObjectStore(PROJECTS_IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function readRecord(db: IDBDatabase): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_IDB_STORE, "readonly");
    const store = tx.objectStore(PROJECTS_IDB_STORE);
    const request = store.get(PROJECTS_IDB_RECORD_KEY);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"));
    request.onsuccess = () => {
      const value = request.result;
      resolve(typeof value === "string" ? value : null);
    };
  });
}

function writeRecord(db: IDBDatabase, json: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_IDB_STORE, "readwrite");
    const store = tx.objectStore(PROJECTS_IDB_STORE);
    const request = store.put(json, PROJECTS_IDB_RECORD_KEY);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB write failed"));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
  });
}

export async function readProjectsFromIndexedDb(): Promise<SavedProject[]> {
  try {
    const db = await openProjectsDb();
    try {
      const raw = await readRecord(db);
      if (!raw) return [];
      return parseProjectsPayload(JSON.parse(raw) as unknown).projects;
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}

export async function writeProjectsToIndexedDb(projects: SavedProject[]): Promise<boolean> {
  try {
    const trimmed = trimProjectsToLimit(projects);
    const json = JSON.stringify(trimmed);
    const db = await openProjectsDb();
    try {
      await writeRecord(db, json);
      return true;
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
}

/** @internal test-only */
export async function clearProjectsIndexedDb(): Promise<void> {
  try {
    const db = await openProjectsDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(PROJECTS_IDB_STORE, "readwrite");
        tx.objectStore(PROJECTS_IDB_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("IndexedDB clear failed"));
      });
    } finally {
      db.close();
    }
  } catch {
    // ignore
  }
}
