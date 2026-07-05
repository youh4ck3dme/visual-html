import { vi } from "vitest";

import { getIphoneProfile, type IphoneViewportProfile } from "@/lib/iphone-viewport";

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

function stubMobileMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => {
      if (query.includes("dark")) {
        return createMatchMedia(false);
      }
      if (/\(\s*max-width:\s*767px\s*\)/.test(query)) {
        return createMatchMedia(true);
      }
      if (/\(\s*max-width:\s*1023px\s*\)/.test(query)) {
        return createMatchMedia(true);
      }
      if (/\(\s*min-width:\s*768px\s*\)/.test(query)) {
        return createMatchMedia(false);
      }
      if (/\(\s*min-width:\s*1024px\s*\)/.test(query)) {
        return createMatchMedia(false);
      }
      return createMatchMedia(false);
    }),
  );
}

/** Simulates iPhone viewport for useIsMobile() and matchMedia queries. */
export function setIphoneViewport(profile: IphoneViewportProfile = "air") {
  const device = getIphoneProfile(profile);

  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: device.logicalWidth,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: device.logicalHeight,
  });
  Object.defineProperty(window, "devicePixelRatio", {
    configurable: true,
    writable: true,
    value: device.devicePixelRatio,
  });

  stubMobileMatchMedia();
}

/** Alias for iPhone 17 Air (420×912). */
export function setMobileViewport() {
  setIphoneViewport("air");
}

/** Stub safe-area insets for mobile layout tests (Dynamic Island + home indicator). */
export function mockSafeAreaInsets(insets: { top?: number; bottom?: number } = {}) {
  const top = insets.top ?? 59;
  const bottom = insets.bottom ?? 34;

  document.documentElement.style.setProperty("--editor-safe-top", `${top}px`);
  document.documentElement.style.setProperty("--editor-safe-bottom", `${bottom}px`);
  document.documentElement.style.setProperty("--shell-safe-bottom", `${bottom}px`);
}

/** Restores desktop viewport defaults used by global test setup. */
export function setDesktopViewport() {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1024,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: 768,
  });
  Object.defineProperty(window, "devicePixelRatio", {
    configurable: true,
    writable: true,
    value: 1,
  });

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => {
      const matches = query.includes("dark") || /\(\s*min-width:\s*768px\s*\)/.test(query);
      return { ...createMatchMedia(matches), media: query };
    }),
  );
}
