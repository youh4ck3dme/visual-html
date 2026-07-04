export type Locale = "en" | "sk";

export const LOCALE_STORAGE_KEY = "pngto-locale";

const VALID: Locale[] = ["en", "sk"];

export function parseStoredLocale(stored: string | null, fallback: Locale = "en"): Locale {
  if (stored && VALID.includes(stored as Locale)) return stored as Locale;
  return fallback;
}

export function nextLocaleInCycle(current: Locale): Locale {
  return current === "en" ? "sk" : "en";
}
