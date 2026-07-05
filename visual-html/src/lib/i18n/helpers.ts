import { diagnosticForError } from "@/lib/generation-diagnostics";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import type { ApiError } from "@/types/generation";
import { imageBudgetReport, type ImageBudgetStatus } from "@/lib/image-budget";
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
  wordpress: "forensic.preset.wordpress.label",
};

const PRESET_HINT_KEY: Record<string, MessageKey> = {
  bank: "forensic.preset.bank.focusHint",
  invoice: "forensic.preset.invoice.focusHint",
  dashboard: "forensic.preset.dashboard.focusHint",
  mobile: "forensic.preset.mobile.focusHint",
  wordpress: "forensic.preset.wordpress.focusHint",
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

const UPLOAD_INTERNAL_ERROR_KEYS: Record<string, MessageKey> = {
  "Could not read file": "upload.error.couldNotRead",
  "Could not process image": "upload.error.couldNotProcess",
  "Invalid image": "upload.error.invalidImage",
  "Could not optimize image": "upload.error.couldNotOptimize",
  "Could not prepare image for upload": "upload.error.couldNotPrepare",
};

const DIAGNOSTIC_DETAIL_MESSAGE_KEYS: Record<string, MessageKey> = {
  "Too many requests. Please slow down and try again shortly.":
    "diagnostic.message.rateLimitedUser",
  "Too many requests": "diagnostic.message.rateLimitedShort",
  "AI request timed out": "diagnostic.message.aiRequestTimedOut",
  "Unexpected server error": "diagnostic.message.unexpectedServerError",
  "Failed to upload image for OCR": "diagnostic.message.failedUploadOcr",
  "Failed to reach AI provider": "diagnostic.message.failedReachAiProvider",
  "Empty AI response": "diagnostic.message.emptyAiResponse",
  "OCR provider returned no readable content": "diagnostic.message.ocrNoReadableContent",
  "Mistral rate limit or quota exceeded": "diagnostic.message.mistralQuotaExceeded",
  "All configured Mistral API keys are rate-limited or out of quota":
    "diagnostic.message.allKeysQuotaExhausted",
  "No Mistral API keys configured (set MISTRAL_API_KEY or role-specific keys)":
    "diagnostic.message.noMistralKeys",
  "BLOB_READ_WRITE_TOKEN is not configured": "diagnostic.message.blobTokenNotConfigured",
};

function diagnosticTitleKey(code: ApiErrorCode, phase?: GenerationPhase): MessageKey {
  if (phase === "ocr" && (code === "AI_TIMEOUT" || code === "AI_INVALID_RESPONSE")) {
    return `diagnostic.${code}.titleOcr` as MessageKey;
  }
  return `diagnostic.${code}.title` as MessageKey;
}

export function localizedDiagnosticTitle(
  locale: Locale,
  code: ApiErrorCode,
  fallback: string,
  phase?: GenerationPhase,
) {
  const key = diagnosticTitleKey(code, phase);
  if (messages.en[key]) return msg(locale, key);
  const genericKey = `diagnostic.${code}.title` as MessageKey;
  if (messages.en[genericKey]) return msg(locale, genericKey);
  return fallback;
}

export function localizedDiagnosticDetail(
  locale: Locale,
  code: ApiErrorCode,
  detail: string,
  phase?: GenerationPhase,
): string {
  const uploadKey = UPLOAD_INTERNAL_ERROR_KEYS[detail];
  if (uploadKey) return msg(locale, uploadKey);

  const messageKey = DIAGNOSTIC_DETAIL_MESSAGE_KEYS[detail];
  if (messageKey) return msg(locale, messageKey);

  const authMatch = detail.match(/^AI provider rejected credentials \((\d+)\)$/);
  if (authMatch) {
    return msg(locale, "diagnostic.message.aiAuthRejected", { status: authMatch[1] });
  }

  const providerMatch = detail.match(/^AI provider returned (\d+)$/);
  if (providerMatch) {
    return msg(locale, "diagnostic.message.aiProviderReturned", { status: providerMatch[1] });
  }

  if (detail.startsWith("Automatic JSON repair failed:")) {
    return msg(locale, "diagnostic.message.automaticJsonRepairFailed");
  }

  if (detail.startsWith("AI returned malformed JSON")) {
    return msg(locale, "diagnostic.message.jsonMalformedAfterRepair");
  }

  const resolvedPhase = phase ?? "failed";
  const defaultDetail = diagnosticForError(code, "", resolvedPhase).detail;
  const detailKey = `diagnostic.${code}.detail` as MessageKey;
  if (messages.en[detailKey] && (!detail || detail === defaultDetail)) {
    return msg(locale, detailKey);
  }

  return detail;
}

export function localizedDiagnosticLikelyCause(
  locale: Locale,
  code: ApiErrorCode,
  fallback: string,
  phase?: GenerationPhase,
) {
  const key = `diagnostic.${code}.likelyCause` as MessageKey;
  if (messages.en[key]) {
    const defaultCause = diagnosticForError(code, "", phase ?? "failed").likelyCause;
    if (!fallback || fallback === defaultCause) return msg(locale, key);
  }
  return fallback;
}

export function localizedDiagnosticFix(locale: Locale, code: ApiErrorCode, fallback: string) {
  const key = `diagnostic.${code}.suggestedFix` as MessageKey;
  if (messages.en[key]) return msg(locale, key);
  return fallback;
}

/** Localize diagnostic fields on an ApiError for display in the editor workflow. */
export function withLocalizedApiError(locale: Locale, error: ApiError): ApiError {
  if (!error.diagnostic) return error;
  const phase = error.phase;
  return {
    ...error,
    message: localizedDiagnosticDetail(locale, error.code, error.message, phase),
    diagnostic: {
      ...error.diagnostic,
      title: localizedDiagnosticTitle(locale, error.code, error.diagnostic.title, phase),
      detail: localizedDiagnosticDetail(locale, error.code, error.diagnostic.detail, phase),
      likelyCause: localizedDiagnosticLikelyCause(
        locale,
        error.code,
        error.diagnostic.likelyCause,
        phase,
      ),
      suggestedFix: localizedDiagnosticFix(locale, error.code, error.diagnostic.suggestedFix),
    },
  };
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

const FORENSIC_WARNING_ID_ALIASES: Record<string, string> = {
  "heavy-file": "heavyFile",
  "warn-file": "warnFile",
  "wide-layout": "wideLayout",
  "low-contrast-risk": "lowContrast",
  "oversized-dimension": "oversized",
};

function normalizeForensicWarningId(id: string): string {
  return FORENSIC_WARNING_ID_ALIASES[id] ?? id;
}

export function localizedForensicWarningTitle(locale: Locale, id: string, fallback: string) {
  const key = `forensic.warning.${normalizeForensicWarningId(id)}.title` as MessageKey;
  if (messages.en[key]) return msg(locale, key);
  return fallback;
}

export function localizedForensicWarningDetail(
  locale: Locale,
  id: string,
  fallback: string,
  params?: Record<string, string | number>,
) {
  const key = `forensic.warning.${normalizeForensicWarningId(id)}.detail` as MessageKey;
  if (messages.en[key]) return msg(locale, key, params);
  return fallback;
}

export function resolveForensicWarningDetail(
  locale: Locale,
  warning: { id: string; detail: string },
  sizeBytes: number,
  width: number,
  height: number,
): string {
  const budget = imageBudgetReport(sizeBytes, width, height);
  if (warning.id === "heavy-file") {
    return localizedForensicWarningDetail(locale, warning.id, warning.detail, {
      detail: localizedBudget(locale, budget.status).recommendation,
    });
  }
  if (warning.id === "warn-file") {
    return localizedForensicWarningDetail(locale, warning.id, warning.detail, {
      detail: localizedBudget(locale, budget.status).detail,
    });
  }
  return localizedForensicWarningDetail(locale, warning.id, warning.detail);
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
