import { vi } from "vitest";

const analyzeImageForensicsMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
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
  }),
);

const builderChatMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    content: "<!DOCTYPE html><html><body>AI</body></html>",
  }),
);

vi.mock("@/lib/image-forensics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/image-forensics")>();
  return {
    ...actual,
    analyzeImageForensics: analyzeImageForensicsMock,
  };
});

vi.mock("@tanstack/react-start", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-start")>();
  return {
    ...actual,
    useServerFn: () => builderChatMock,
  };
});