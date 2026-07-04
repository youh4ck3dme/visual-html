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
  try {
    if (sessionStorage.getItem(PROJECTS_FALLBACK_SESSION_KEY) === "indexedDB") return true;
    if (localStorage.getItem(PROJECTS_BACKEND_MARKER_KEY) === "indexedDB") return true;
  } catch {
    // storage unavailable
  }
  return false;
}

export function markProjectsFallbackActive(): void {
  fallbackActiveInMemory = true;
  try {
    sessionStorage.setItem(PROJECTS_FALLBACK_SESSION_KEY, "indexedDB");
    localStorage.setItem(PROJECTS_BACKEND_MARKER_KEY, "indexedDB");
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
    sessionStorage.removeItem(PROJECTS_FALLBACK_SESSION_KEY);
    localStorage.removeItem(PROJECTS_BACKEND_MARKER_KEY);
  } catch {
    // ignore
  }
}
