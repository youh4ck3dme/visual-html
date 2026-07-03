import { imageBudgetReport } from "@/lib/image-budget";
import type { GenerationOptions } from "@/types/generation";

export type ForensicZoneType =
  "header" | "sidebar" | "content" | "footer" | "table" | "cards" | "cta" | "navigation";

export interface ForensicZone {
  id: string;
  type: ForensicZoneType;
  label: string;
  confidence: number;
  bounds: { x: number; y: number; w: number; h: number };
  detail: string;
}

export type ForensicWarningSeverity = "info" | "warn" | "critical";

export interface ForensicWarning {
  id: string;
  severity: ForensicWarningSeverity;
  title: string;
  detail: string;
}

export interface ForensicsReport {
  zones: ForensicZone[];
  warnings: ForensicWarning[];
  densityMap: number[];
  aspectProfile: string;
  tokenEstimate: { min: number; max: number; seconds: number };
  ocrHints: string[];
}

export interface ForensicPreset {
  id: string;
  label: string;
  icon: string;
  patch: Partial<GenerationOptions>;
  focusHint: string;
}

export const FORENSIC_PRESETS: ForensicPreset[] = [
  {
    id: "bank",
    label: "Bank statement",
    icon: "🏦",
    patch: {
      responsiveness: "desktop-first",
      additionalInstructions:
        "Treat as a bank statement or financial table. Preserve row/column alignment, numeric columns, headers, and print-friendly layout.",
    },
    focusHint: "Optimized for dense tables and numeric columns.",
  },
  {
    id: "invoice",
    label: "Invoice",
    icon: "🧾",
    patch: {
      responsiveness: "adaptive",
      additionalInstructions:
        "Treat as an invoice or receipt. Preserve line items, totals, tax rows, addresses, and logo placement.",
    },
    focusHint: "Line items, totals, and header blocks.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    patch: {
      responsiveness: "desktop-first",
      additionalInstructions:
        "Treat as a SaaS dashboard. Preserve sidebar, KPI cards, charts placeholders, and data tables.",
    },
    focusHint: "Cards, sidebar, and chart regions.",
  },
  {
    id: "mobile",
    label: "Mobile app",
    icon: "📱",
    patch: {
      responsiveness: "mobile-first",
      additionalInstructions:
        "Treat as a mobile app screen. Prioritize thumb-friendly spacing, bottom nav, and single-column flow.",
    },
    focusHint: "Mobile-first spacing and stacked layout.",
  },
] as ForensicPreset[];

const GRID = 8;

export function estimateTokenBudget(
  sizeBytes: number,
  width: number,
  height: number,
): ForensicsReport["tokenEstimate"] {
  const pixels = width * height;
  const min = Math.round(1800 + pixels / 1200 + sizeBytes / 800);
  const max = Math.round(min * 1.45);
  const seconds = Math.min(55, Math.round(8 + sizeBytes / 120_000 + pixels / 400_000));
  return { min, max, seconds };
}

export function fidelityInstruction(fidelity: number): string {
  if (fidelity >= 85) {
    return "Maximum pixel-perfect fidelity. Match spacing, colors, typography, and borders exactly.";
  }
  if (fidelity >= 55) {
    return "Balanced fidelity. Preserve layout and hierarchy; minor simplification allowed for repetitive elements.";
  }
  return "Simplified rebuild. Keep structure and content; reduce decorative noise and redundant wrappers.";
}

export function regionFocusInstruction(zone: ForensicZone, fidelity: number): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const b = zone.bounds;
  return [
    `Generate ONLY the "${zone.label}" region (${zone.type}).`,
    `Region bounds (normalized): left ${pct(b.x)}, top ${pct(b.y)}, width ${pct(b.w)}, height ${pct(b.h)}.`,
    `Use minimal placeholders outside this region.`,
    fidelityInstruction(fidelity),
    zone.detail,
  ].join(" ");
}

export function buildForensicOptions(
  base: GenerationOptions,
  fidelity: number,
  zone?: ForensicZone | null,
  preset?: ForensicPreset | null,
): GenerationOptions {
  const parts = [base.additionalInstructions?.trim() || "", fidelityInstruction(fidelity)];
  if (preset?.patch.additionalInstructions) parts.push(preset.patch.additionalInstructions);
  if (zone) parts.push(regionFocusInstruction(zone, fidelity));

  return {
    ...base,
    ...preset?.patch,
    additionalInstructions: parts.filter(Boolean).join("\n\n"),
  };
}

function inferAspectProfile(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 2.2) return "Ultra-wide document / panorama";
  if (ratio > 1.45) return "Desktop landscape UI";
  if (ratio < 0.55) return "Mobile portrait screen";
  if (ratio < 0.85) return "Tall mobile / narrow layout";
  return "Balanced app canvas";
}

export function buildStructuralWarnings(
  sizeBytes: number,
  width: number,
  height: number,
  avgLuminance: number,
): ForensicWarning[] {
  const warnings: ForensicWarning[] = [];
  const budget = imageBudgetReport(sizeBytes, width, height);
  const ratio = width / height;

  if (budget.status === "heavy") {
    warnings.push({
      id: "heavy-file",
      severity: "critical",
      title: "Heavy for AI pipeline",
      detail: budget.recommendation,
    });
  } else if (budget.status === "warning") {
    warnings.push({
      id: "warn-file",
      severity: "warn",
      title: "Slower synthesis likely",
      detail: budget.detail,
    });
  }

  if (ratio > 2.4) {
    warnings.push({
      id: "wide-layout",
      severity: "warn",
      title: "Very wide layout",
      detail: "Consider cropping to the main content column before generation.",
    });
  }

  if (avgLuminance > 210) {
    warnings.push({
      id: "low-contrast-risk",
      severity: "info",
      title: "Bright UI detected",
      detail: "Low-contrast gray text may be harder to OCR — enable Strict accessibility.",
    });
  }

  if (Math.max(width, height) > 1600) {
    warnings.push({
      id: "oversized-dimension",
      severity: "warn",
      title: "Long edge above 1600px",
      detail: "Auto-compression helps, but resizing improves OCR accuracy.",
    });
  }

  return warnings;
}

function cellEdgeScore(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  cy: number,
): number {
  const x0 = Math.floor((cx / GRID) * w);
  const y0 = Math.floor((cy / GRID) * h);
  const x1 = Math.floor(((cx + 1) / GRID) * w);
  const y1 = Math.floor(((cy + 1) / GRID) * h);
  let sum = 0;
  let count = 0;

  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * w + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const right =
        x + 1 < w ? 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6] : lum;
      const down =
        y + 1 < h
          ? 0.299 * data[i + w * 4] + 0.587 * data[i + w * 4 + 1] + 0.114 * data[i + w * 4 + 2]
          : lum;
      sum += Math.abs(lum - right) + Math.abs(lum - down);
      count += 1;
    }
  }

  return count ? sum / count : 0;
}

function bandScore(
  density: number[][],
  rowStart: number,
  rowEnd: number,
  colStart = 0,
  colEnd = GRID,
): number {
  let sum = 0;
  let n = 0;
  for (let r = rowStart; r < rowEnd; r++) {
    for (let c = colStart; c < colEnd; c++) {
      sum += density[r][c];
      n += 1;
    }
  }
  return n ? sum / n : 0;
}

export function inferZonesFromDensity(density: number[][]): ForensicZone[] {
  const zones: ForensicZone[] = [];
  const top = bandScore(density, 0, 2);
  const left = bandScore(density, 0, GRID, 0, 2);
  const center = bandScore(density, 2, 6, 2, 6);
  const bottom = bandScore(density, 6, GRID);
  const rightStrip = bandScore(density, 2, 7, 6, GRID);

  if (top > 0.22) {
    zones.push({
      id: "header",
      type: "header",
      label: "Header / top bar",
      confidence: Math.min(95, Math.round(top * 220)),
      bounds: { x: 0, y: 0, w: 1, h: 0.14 },
      detail: "Navigation, logo, and primary actions likely live here.",
    });
  }

  if (left > center * 1.15 && left > 0.18) {
    zones.push({
      id: "sidebar",
      type: "sidebar",
      label: "Sidebar navigation",
      confidence: Math.min(92, Math.round(left * 200)),
      bounds: { x: 0, y: 0.12, w: 0.2, h: 0.76 },
      detail: "Vertical menu or filter rail detected on the left edge.",
    });
  }

  zones.push({
    id: "content",
    type: "content",
    label: "Main content",
    confidence: Math.min(98, Math.round(center * 180 + 40)),
    bounds: { x: left > 0.18 ? 0.2 : 0.05, y: top > 0.22 ? 0.14 : 0.06, w: 0.72, h: 0.7 },
    detail: "Primary reading surface — cards, forms, or article body.",
  });

  if (center > 0.35 && bandScore(density, 3, 6, 2, 6) > 0.4) {
    zones.push({
      id: "table",
      type: "table",
      label: "Table / grid block",
      confidence: Math.min(88, Math.round(center * 160)),
      bounds: { x: 0.15, y: 0.28, w: 0.7, h: 0.45 },
      detail: "Dense horizontal bands suggest rows, columns, or spreadsheet cells.",
    });
  }

  if (center > 0.28 && center < 0.42) {
    zones.push({
      id: "cards",
      type: "cards",
      label: "Card cluster",
      confidence: Math.min(80, Math.round(center * 150)),
      bounds: { x: 0.22, y: 0.22, w: 0.56, h: 0.5 },
      detail: "Repeated panels with similar visual weight.",
    });
  }

  if (rightStrip > center * 1.1 && rightStrip > 0.2) {
    zones.push({
      id: "cta",
      type: "cta",
      label: "CTA / action rail",
      confidence: Math.min(75, Math.round(rightStrip * 170)),
      bounds: { x: 0.78, y: 0.2, w: 0.2, h: 0.55 },
      detail: "Buttons or action stack on the right edge.",
    });
  }

  if (bottom > 0.2) {
    zones.push({
      id: "footer",
      type: "footer",
      label: "Footer",
      confidence: Math.min(85, Math.round(bottom * 190)),
      bounds: { x: 0, y: 0.86, w: 1, h: 0.14 },
      detail: "Secondary links, legal copy, or pagination.",
    });
  }

  return zones;
}

export function buildOcrHints(zones: ForensicZone[], width: number, height: number): string[] {
  const hints = [
    `Canvas ${width}×${height} — OCR runs on full image at generation time.`,
    `${zones.length} structural zones mapped for targeted prompts.`,
  ];
  if (zones.some((z) => z.type === "table"))
    hints.push("Table-like density — preserve column alignment in HTML.");
  if (zones.some((z) => z.type === "header"))
    hints.push("Header strip — extract nav labels and logo alt text.");
  if (zones.some((z) => z.type === "sidebar"))
    hints.push("Sidebar — use <nav> and list semantics.");
  return hints;
}

export async function analyzeImageForensics(
  src: string,
  width: number,
  height: number,
  fileSize: number,
): Promise<ForensicsReport> {
  const density: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));
  let avgLuminance = 180;

  if (typeof document !== "undefined") {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 480 / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let lumSum = 0;
      for (let i = 0; i < data.length; i += 16) {
        lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      avgLuminance = lumSum / (data.length / 16);

      const flat: number[] = [];
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const score = cellEdgeScore(data, canvas.width, canvas.height, col, row);
          density[row][col] = score;
          flat.push(score);
        }
      }
      const max = Math.max(...flat, 1);
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) density[row][col] /= max;
      }
    }
  }

  const zones = inferZonesFromDensity(density);
  const warnings = buildStructuralWarnings(fileSize, width, height, avgLuminance);

  return {
    zones,
    warnings,
    densityMap: density.flat(),
    aspectProfile: inferAspectProfile(width, height),
    tokenEstimate: estimateTokenBudget(fileSize, width, height),
    ocrHints: buildOcrHints(zones, width, height),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for forensics"));
    img.src = src;
  });
}

export const ZONE_COLORS: Record<ForensicZoneType, string> = {
  header: "rgba(59,130,246,0.35)",
  sidebar: "rgba(168,85,247,0.35)",
  content: "rgba(16,185,129,0.28)",
  footer: "rgba(107,114,128,0.35)",
  table: "rgba(245,158,11,0.38)",
  cards: "rgba(236,72,153,0.32)",
  cta: "rgba(239,68,68,0.35)",
  navigation: "rgba(14,165,233,0.35)",
};
