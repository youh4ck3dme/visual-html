import { Languages } from "lucide-react";

import { useLocale } from "@/hooks/use-locale";
import { useT } from "@/hooks/use-t";
import { nextLocaleInCycle, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Locale; labelKey: "locale.en" | "locale.sk" }[] = [
  { value: "en", labelKey: "locale.en" },
  { value: "sk", labelKey: "locale.sk" },
];

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, hydrated, setLocale } = useLocale();
  const { t } = useT();
  const displayLocale = hydrated ? locale : "en";

  if (compact) {
    const label = displayLocale === "sk" ? t("locale.sk") : t("locale.en");
    return (
      <button
        type="button"
        onClick={() => setLocale(nextLocaleInCycle(displayLocale))}
        aria-label={t("locale.switchAria", { lang: label })}
        title={label}
        className={cn(
          "grid h-11 min-w-11 place-items-center rounded-lg text-shell-muted transition-colors duration-300",
          "hover:bg-shell-hover hover:text-foreground",
        )}
      >
        <Languages className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("locale.groupAria")}
      className="relative flex items-center gap-0.5 rounded-lg border border-shell-border bg-shell-elevated p-0.5 shadow-sm"
    >
      {OPTIONS.map(({ value, labelKey }) => {
        const active = displayLocale === value;
        const label = t(labelKey);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => setLocale(value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors duration-300",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-shell-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
