import { afterEach, describe, expect, it, vi } from "vitest";

import { getIndexedDb, getLocalStorage, getSessionStorage, isBrowser } from "@/lib/browser-env";

describe("browser-env", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("isBrowser is false when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(isBrowser()).toBe(false);
    expect(getLocalStorage()).toBeNull();
    expect(getSessionStorage()).toBeNull();
    expect(getIndexedDb()).toBeNull();
  });

  it("storage helpers return null when browser APIs are undefined", () => {
    vi.stubGlobal("window", {
      localStorage: undefined,
      sessionStorage: undefined,
      indexedDB: undefined,
    });
    expect(getLocalStorage()).toBeNull();
    expect(getSessionStorage()).toBeNull();
    expect(getIndexedDb()).toBeNull();
  });
});
