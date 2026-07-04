/** True when running in a browser (not Node SSR). */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getLocalStorage(): Storage | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getSessionStorage(): Storage | null {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}

export function getIndexedDb(): IDBFactory | null {
  if (!isBrowser()) return null;
  try {
    return window.indexedDB ?? null;
  } catch {
    return null;
  }
}
