import { vi } from "vitest";

function createMatchMedia(matches: boolean) {
  return {
    matches,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

/** Simulates iPhone 17 Air width (375px) for useIsMobile() and matchMedia queries. */
export function setMobileViewport() {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 375,
  });

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => {
      if (query.includes("dark")) {
        return createMatchMedia(false);
      }
      if (/\(\s*max-width:\s*767px\s*\)/.test(query)) {
        return createMatchMedia(true);
      }
      if (/\(\s*min-width:\s*768px\s*\)/.test(query)) {
        return createMatchMedia(false);
      }
      return createMatchMedia(false);
    }),
  );
}

/** Restores desktop viewport defaults used by global test setup. */
export function setDesktopViewport() {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1024,
  });

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => {
      const matches = query.includes("dark") || /\(\s*min-width:\s*768px\s*\)/.test(query);
      return { ...createMatchMedia(matches), media: query };
    }),
  );
}
