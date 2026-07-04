import { getLocalStorage, getSessionStorage } from "@/lib/browser-env";

export const PROJECTS_BACKEND_MARKER_KEY = "pngto-projects-backend";
export const PROJECTS_FALLBACK_SESSION_KEY = "pngto-projects-fallback";

let migrationPersistWarningShown = false;
let fallbackInfoToastShown = false;
let fallbackActiveInMemory = false;

export function shouldShowMigrationPersistWarning(): boolean {
  if (migrationPersistWarningShown) return false;
  migrationPersistWarningShown = true;
  return true;
}

export function shouldShowFallbackInfoToast(): boolean {
  if (fallbackInfoToastShown) return false;
  fallbackInfoToastShown = true;
  return true;
}

export function isProjectsFallbackActive(): boolean {
  return fallbackActiveInMemory;
}

export function shouldPreferIndexedDbBackend(): boolean {
  if (fallbackActiveInMemory) return true;
  const session = getSessionStorage();
  const local = getLocalStorage();
  try {
    if (session?.getItem(PROJECTS_FALLBACK_SESSION_KEY) === "indexedDB") return true;
    if (local?.getItem(PROJECTS_BACKEND_MARKER_KEY) === "indexedDB") return true;
  } catch {
    // storage unavailable
  }
  return false;
}

export function markProjectsFallbackActive(): void {
  fallbackActiveInMemory = true;
  const session = getSessionStorage();
  const local = getLocalStorage();
  try {
    session?.setItem(PROJECTS_FALLBACK_SESSION_KEY, "indexedDB");
    local?.setItem(PROJECTS_BACKEND_MARKER_KEY, "indexedDB");
  } catch {
    // best effort
  }
}

/** @internal test-only */
export function resetProjectsStorageWarningsForTests() {
  migrationPersistWarningShown = false;
  fallbackInfoToastShown = false;
  fallbackActiveInMemory = false;
  try {
    getSessionStorage()?.removeItem(PROJECTS_FALLBACK_SESSION_KEY);
    getLocalStorage()?.removeItem(PROJECTS_BACKEND_MARKER_KEY);
  } catch {
    // ignore
  }
}
