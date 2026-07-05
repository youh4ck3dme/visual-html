import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Parallel vitest workers slow async UI; default 1s waitFor is too tight under load.
configure({ asyncUtilTimeout: 5000 });

import { installFakeIndexedDb, resetFakeIndexedDb } from "@/test/mocks/fake-indexeddb";
import { resetForensicsMock, resetServerFnMocks } from "@/test/mocks/server-fns";

class ImageStub {
  naturalWidth = 1;
  naturalHeight = 1;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

installFakeIndexedDb();

beforeEach(() => {
  resetServerFnMocks();
  resetForensicsMock();
  resetFakeIndexedDb();
  vi.stubGlobal("Image", ImageStub);

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/jpeg;base64,dGVzdA==",
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    type?: string,
  ) {
    callback(new Blob(["test"], { type: type ?? "image/png" }));
  });

  localStorage.clear();
  localStorage.setItem("pngto-locale", "en");
  sessionStorage.clear();

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark") || /\(\s*min-width:\s*768px\s*\)/.test(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );

  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserverStub {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );

  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });

  window.confirm = vi.fn(() => true);
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
