import { messages, type MessageKey } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import type { ImageBudgetStatus } from "@/lib/image-budget";
import type { ForensicPreset, ForensicZone, ForensicZoneType } from "@/lib/image-forensics";
import type { ApiErrorCode } from "@/types/generation";
import type { GenerationPhase } from "@/types/generation";

function msg(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
  let text: string = messages[locale][key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function localizedBudget(
  locale: Locale,
  status: ImageBudgetStatus,
): { label: string; detail: string; recommendation: string } {
  return {
    label: msg(locale, `imageBudget.${status}.label` as MessageKey),
    detail: msg(locale, `imageBudget.${status}.detail` as MessageKey),
    recommendation: msg(locale, `imageBudget.${status}.recommendation` as MessageKey),
  };
}

const PRESET_KEY: Record<string, MessageKey> = {
  bank: "forensic.preset.bank.label",
  invoice: "forensic.preset.invoice.label",
  dashboard: "forensic.preset.dashboard.label",
  mobile: "forensic.preset.mobile.label",
};

const PRESET_HINT_KEY: Record<string, MessageKey> = {
  bank: "forensic.preset.bank.focusHint",
  invoice: "forensic.preset.invoice.focusHint",
  dashboard: "forensic.preset.dashboard.focusHint",
  mobile: "forensic.preset.mobile.focusHint",
};

export function localizedPresetLabel(locale: Locale, preset: ForensicPreset): string {
  return msg(locale, PRESET_KEY[preset.id] ?? ("forensic.preset.bank.label" as MessageKey));
}

export function localizedPresetHint(locale: Locale, preset: ForensicPreset): string {
  return msg(
    locale,
    PRESET_HINT_KEY[preset.id] ?? ("forensic.preset.bank.focusHint" as MessageKey),
  );
}

export function localizedZoneLabel(locale: Locale, zone: ForensicZone): string {
  const key = `forensic.zone.${zone.type}.label` as MessageKey;
  return messages[locale][key] ? msg(locale, key) : zone.label;
}

export function localizedZoneDetail(locale: Locale, zone: ForensicZone): string {
  const key = `forensic.zone.${zone.type}.detail` as MessageKey;
  return messages[locale][key] ? msg(locale, key) : zone.detail;
}

export function localizedPhaseLabel(locale: Locale, phase: GenerationPhase): string {
  const key = `phase.${phase}` as MessageKey;
  return msg(locale, key);
}

const DIAG_CODES: ApiErrorCode[] = [
  "INVALID_FILE",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_FORMAT",
  "AI_TIMEOUT",
  "AI_AUTH_ERROR",
  "AI_QUOTA_EXHAUSTED",
  "AI_INVALID_RESPONSE",
  "BLOB_UPLOAD_FAILED",
  "JSON_REPAIR_FAILED",
  "RATE_LIMITED",
  "SERVER_ERROR",
  "MISSING_API_KEY",
  "MISSING_BLOB_TOKEN",
  "SANITIZE_FAILED",
];

export function localizedDiagnosticTitle(locale: Locale, code: ApiErrorCode, fallback: string) {
  const key = `diagnostic.${code}.title` as MessageKey;
  if (messages.en[key]) return msg(locale, key);
  return fallback;
}

export function localizedDiagnosticFix(locale: Locale, code: ApiErrorCode, fallback: string) {
  const key = `diagnostic.${code}.suggestedFix` as MessageKey;
  if (messages.en[key]) return msg(locale, key);
  return fallback;
}

export function localizedAspectProfile(locale: Locale, profile: string): string {
  const map: Record<string, MessageKey> = {
    "Ultra-wide document / panorama": "forensic.aspect.ultraWide",
    "Desktop landscape UI": "forensic.aspect.desktopLandscape",
    "Mobile portrait screen": "forensic.aspect.mobilePortrait",
    "Tall mobile / narrow layout": "forensic.aspect.tallMobile",
    "Balanced app canvas": "forensic.aspect.balanced",
  };
  const key = map[profile];
  return key ? msg(locale, key) : profile;
}

export function localizedForensicWarningTitle(locale: Locale, id: string, fallback: string) {
  const key = `forensic.warning.${id}.title` as MessageKey;
  if (messages.en[key]) return msg(locale, key);
  return fallback;
}

export function localizedForensicWarningDetail(
  locale: Locale,
  id: string,
  fallback: string,
  params?: Record<string, string | number>,
) {
  const key = `forensic.warning.${id}.detail` as MessageKey;
  if (messages.en[key]) return msg(locale, key, params);
  return fallback;
}

const OCR_HINT_KEYS: Record<string, MessageKey> = {
  "Table-like density — preserve column alignment in HTML.": "forensic.ocr.tableDensity",
  "Header strip — extract nav labels and logo alt text.": "forensic.ocr.headerStrip",
  "Sidebar — use <nav> and list semantics.": "forensic.ocr.sidebarNav",
};

export function localizedOcrHint(locale: Locale, hint: string): string {
  const canvasMatch = hint.match(/^Canvas (\d+)×(\d+)/);
  if (canvasMatch) {
    return msg(locale, "forensic.ocr.canvas", {
      width: canvasMatch[1],
      height: canvasMatch[2],
    });
  }
  const zonesMatch = hint.match(/^(\d+) structural zones mapped/);
  if (zonesMatch) {
    return msg(locale, "forensic.ocr.zonesMapped", { count: zonesMatch[1] });
  }
  const key = OCR_HINT_KEYS[hint];
  return key ? msg(locale, key) : hint;
}

export function localizedBuilderCategory(locale: Locale, id: string, fallback: string) {
  const key = `builder.category.${id}` as MessageKey;
  if (messages.en[key]) return msg(locale, key);
  return fallback;
}

export type ForensicZoneTypeKey = ForensicZoneType;
