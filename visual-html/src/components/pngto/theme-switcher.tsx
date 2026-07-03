import { Monitor, Moon, Sun } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { compactSwitcherIcon, nextThemeInCycle, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const OPTIONS: {
  value: Theme;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
  icon: typeof Sun;
}[] = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
];

const ICONS = { sun: Sun, moon: Moon, monitor: Monitor } as const;

const ACTIVE_INDEX: Record<Theme, number> = { light: 0, dark: 1, system: 2 };

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const { theme, resolvedTheme, hydrated, setTheme } = useTheme();
  const displayTheme = hydrated ? theme : "dark";
  const displayResolved = hydrated ? resolvedTheme : "dark";

  const resolvedLabel = t(`theme.${displayResolved}`);

  if (compact) {
    const iconKey = compactSwitcherIcon(displayTheme);
    const Icon = ICONS[iconKey];
    const label =
      displayTheme === "system"
        ? t("theme.systemResolved", { resolved: resolvedLabel })
        : t(`theme.${displayTheme}`);

    return (
      <button
        type="button"
        onClick={() => setTheme(nextThemeInCycle(theme))}
        aria-label={t("theme.compactAria", { label })}
        title={label}
        className={cn(
          "grid h-11 min-w-11 place-items-center rounded-lg text-shell-muted transition-colors duration-300",
          "hover:bg-shell-hover hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  const activeIndex = ACTIVE_INDEX[displayTheme];

  return (
    <div
      role="group"
      aria-label={t("theme.groupAria")}
      className="relative flex items-center gap-0.5 rounded-lg border border-shell-border bg-shell-elevated p-0.5 shadow-sm"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-md bg-primary shadow-sm transition-transform duration-300 ease-out"
        style={{
          width: "calc((100% - 0.25rem) / 3)",
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />
      {OPTIONS.map(({ value, labelKey, icon: Icon }) => {
        const active = displayTheme === value;
        const label = t(labelKey);
        const resolvedHint = value === "system" ? ` (${resolvedLabel})` : "";
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={`${label}${resolvedHint}`}
            title={`${label}${resolvedHint}`}
            onClick={() => setTheme(value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors duration-300",
              active ? "text-primary-foreground" : "text-shell-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
