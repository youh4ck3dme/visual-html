import { messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import type { GenerationOptions } from "@/types/generation";

const STORAGE_KEY = "pngto-generation-defaults";

export const GENERATION_DEFAULTS_CHANGE_EVENT = "pngto-generation-defaults-change";

export function createDefaultGenerationOptions(locale: Locale = "en"): GenerationOptions {
  return {
    outputMode: "static",
    stylingMode: "vanilla-css",
    responsiveness: "adaptive",
    accessibilityLevel: "strict",
    additionalInstructions: messages[locale]["options.defaultInstructions"],
  };
}

export const DEFAULT_GENERATION_OPTIONS = createDefaultGenerationOptions("en");

function isGenerationOptions(value: unknown): value is GenerationOptions {
  if (!value || typeof value !== "object") return false;
  const o = value as Partial<GenerationOptions>;
  return (
    typeof o.outputMode === "string" &&
    typeof o.stylingMode === "string" &&
    typeof o.responsiveness === "string" &&
    typeof o.accessibilityLevel === "string" &&
    typeof o.additionalInstructions === "string"
  );
}

export function loadGenerationDefaults(locale: Locale = "en"): GenerationOptions {
  if (typeof window === "undefined") return createDefaultGenerationOptions(locale);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGenerationOptions(locale);
    const parsed: unknown = JSON.parse(raw);
    if (!isGenerationOptions(parsed)) return createDefaultGenerationOptions(locale);
    return {
      ...createDefaultGenerationOptions(locale),
      ...parsed,
      additionalInstructions:
        parsed.additionalInstructions ||
        messages[locale]["options.defaultInstructions"],
    };
  } catch {
    return createDefaultGenerationOptions(locale);
  }
}

export function saveGenerationDefaults(options: GenerationOptions): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    window.dispatchEvent(new CustomEvent(GENERATION_DEFAULTS_CHANGE_EVENT));
  } catch {
    // ignore restricted storage
  }
}
