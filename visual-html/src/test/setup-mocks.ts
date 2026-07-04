import { vi, type Mock } from "vitest";

import { builderAiStatus, builderChat } from "@/lib/builder.functions";
import {
  continueHtml,
  fetchImageFromUrl,
  generateHtml,
  refineHtml,
  runOcr,
} from "@/lib/generate.functions";
import { applyDefaultServerFnMocks } from "@/test/mocks/server-fns";

type ServerFnMockBag = {
  runOcr: Mock;
  generateHtml: Mock;
  refineHtml: Mock;
  continueHtml: Mock;
  builderChat: Mock;
  builderAiStatus: Mock;
  fetchImageFromUrl: Mock;
};

declare global {
  var __PNGTO_TEST_SERVER_FN_MOCKS__: ServerFnMockBag | undefined;
  var __PNGTO_TEST_SERVER_FN_REGISTRY__: Map<unknown, Mock> | undefined;
  var __PNGTO_FORENSICS_MOCK__: Mock | undefined;
}

vi.hoisted(() => {
  const mocks: ServerFnMockBag = {
    runOcr: vi.fn(),
    generateHtml: vi.fn(),
    refineHtml: vi.fn(),
    continueHtml: vi.fn(),
    builderChat: vi.fn(),
    builderAiStatus: vi.fn(),
    fetchImageFromUrl: vi.fn(),
  };

  globalThis.__PNGTO_TEST_SERVER_FN_MOCKS__ = mocks;

  globalThis.__PNGTO_FORENSICS_MOCK__ = vi.fn().mockResolvedValue({
    aspectProfile: "Landscape UI · 16:9 profile",
    densityMap: Array.from({ length: 64 }, (_, i) => (i < 16 ? 0.85 : i < 40 ? 0.45 : 0.12)),
    ocrHints: ["Header navigation detected"],
    tokenEstimate: { min: 4200, max: 8900, seconds: 18 },
    warnings: [],
    zones: [
      {
        id: "header",
        type: "header",
        label: "Header",
        confidence: 88,
        bounds: { x: 0, y: 0, w: 1, h: 0.12 },
        detail: "Top navigation band",
      },
      {
        id: "content",
        type: "content",
        label: "Main content",
        confidence: 92,
        bounds: { x: 0.15, y: 0.12, w: 0.7, h: 0.7 },
        detail: "Primary content area",
      },
      {
        id: "footer",
        type: "footer",
        label: "Footer",
        confidence: 74,
        bounds: { x: 0, y: 0.88, w: 1, h: 0.12 },
        detail: "Bottom bar",
      },
    ],
  });
});

applyDefaultServerFnMocks(globalThis.__PNGTO_TEST_SERVER_FN_MOCKS__!);

function ensureServerFnRegistry(): Map<unknown, Mock> {
  if (globalThis.__PNGTO_TEST_SERVER_FN_REGISTRY__) {
    return globalThis.__PNGTO_TEST_SERVER_FN_REGISTRY__;
  }

  const mocks = globalThis.__PNGTO_TEST_SERVER_FN_MOCKS__;
  if (!mocks) {
    throw new Error("Server function mocks are not initialized.");
  }

  const registry = new Map<unknown, Mock>([
    [runOcr, mocks.runOcr],
    [generateHtml, mocks.generateHtml],
    [refineHtml, mocks.refineHtml],
    [continueHtml, mocks.continueHtml],
    [builderChat, mocks.builderChat],
    [builderAiStatus, mocks.builderAiStatus],
    [fetchImageFromUrl, mocks.fetchImageFromUrl],
  ]);

  globalThis.__PNGTO_TEST_SERVER_FN_REGISTRY__ = registry;
  return registry;
}

vi.mock("@/lib/image-forensics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/image-forensics")>();
  return {
    ...actual,
    analyzeImageForensics: (...args: unknown[]) => globalThis.__PNGTO_FORENSICS_MOCK__!(...args),
  };
});

vi.mock("@tanstack/react-start", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-start")>();
  return {
    ...actual,
    useServerFn: (serverFn: unknown) => {
      const mock = ensureServerFnRegistry().get(serverFn);
      if (!mock) {
        const name =
          typeof serverFn === "function" && serverFn.name ? serverFn.name : String(serverFn);
        throw new Error(
          `useServerFn mock: unregistered server function "${name}". Register it in src/test/setup-mocks.ts.`,
        );
      }
      return (...args: unknown[]) => mock(...args);
    },
  };
});
