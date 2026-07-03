import { useCallback } from "react";

import { messages, type MessageKey } from "@/lib/i18n/messages";
import { useLocale } from "@/hooks/use-locale";

export function useT() {
  const { locale } = useLocale();

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => {
      let text: string = messages[locale][key] ?? messages.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [locale],
  );

  return { t, locale };
}
