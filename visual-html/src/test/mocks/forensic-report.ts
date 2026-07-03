import type { ForensicsReport } from "@/lib/image-forensics";

export const MOCK_FORENSIC_REPORT: ForensicsReport = {
  aspectProfile: "Landscape UI · 16:9 profile",
  densityMap: Array.from({ length: 64 }, (_, i) => (i < 16 ? 0.85 : i < 40 ? 0.45 : 0.12)),
  ocrHints: ["Header navigation detected", "Dense table region in center"],
  tokenEstimate: { min: 4200, max: 8900, seconds: 18 },
  warnings: [
    {
      id: "warn-file",
      severity: "warn",
      title: "Large screenshot",
      detail: "May increase OCR latency.",
    },
  ],
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
};