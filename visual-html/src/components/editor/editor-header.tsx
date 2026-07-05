import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { NAV_ITEMS, type NavTo } from "@/components/app/nav-config";
import { useSettingsDialog } from "@/components/app/settings-context";
import { AppLogo } from "@/components/pngto/app-logo";
import { LocaleSwitcher } from "@/components/pngto/locale-switcher";
import { ThemeSwitcher } from "@/components/pngto/theme-switcher";
import { useT } from "@/hooks/use-t";
import { formatModelPrice, MODEL_PRICING } from "@/lib/ai/model-pricing";
import { getBuilderMistralModel, saveBuilderModel } from "@/lib/builder/generate";
import { cn } from "@/lib/utils";

export const BUILDER_MODEL_CHANGE_EVENT = "pngto-builder-model-change";

function NavTab({
  id,
  label,
  icon: Icon,
  to,
}: {
  id: string;
  label: string;
  icon: (typeof NAV_ITEMS)[number]["icon"];
  to: NavTo;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      data-testid={`nav-${id}`}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        "text-[var(--editor-muted)] hover:bg-[var(--editor-hover)] hover:text-[var(--editor-fg)]",
      )}
      activeProps={{
        className: cn(
          "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
          "bg-[var(--editor-accent-dim)] text-[var(--editor-accent)] ring-1 ring-inset ring-[var(--editor-accent)]/30",
        ),
        "aria-current": "page" as const,
      }}
      inactiveProps={{
        className: cn(
          "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          "text-[var(--editor-muted)] hover:bg-[var(--editor-hover)] hover:text-[var(--editor-fg)]",
        ),
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function ModelPicker() {
  const { t } = useT();
  const [model, setModel] = useState("mistral-large-latest");

  const sync = useCallback(() => setModel(getBuilderMistralModel()), []);

  useEffect(() => {
    sync();
    window.addEventListener(BUILDER_MODEL_CHANGE_EVENT, sync);
    return () => window.removeEventListener(BUILDER_MODEL_CHANGE_EVENT, sync);
  }, [sync]);

  const onChange = (next: string) => {
    setModel(next);
    saveBuilderModel(next);
    window.dispatchEvent(new CustomEvent(BUILDER_MODEL_CHANGE_EVENT));
  };

  return (
    <select
      aria-label={t("editor.modelPickerAria")}
      title={formatModelPrice(MODEL_PRICING.find((m) => m.id === model) ?? MODEL_PRICING[0])}
      value={model}
      onChange={(e) => onChange(e.target.value)}
      data-testid="editor-model-picker"
      className="hidden h-9 max-w-[9rem] truncate rounded-lg border border-[var(--editor-border)] bg-[var(--editor-panel)] px-2 text-[11px] text-[var(--editor-fg)] lg:block"
    >
      {MODEL_PRICING.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}

export function EditorHeader() {
  const { t } = useT();
  const { openSettings } = useSettingsDialog();

  return (
    <header
      className="editor-header flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--editor-border)] bg-[var(--editor-panel)] px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:px-4"
      data-testid="editor-header"
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-lg pr-2"
        aria-label={t("nav.homeAria")}
        data-testid="nav-home"
      >
        <AppLogo size="sm" />
        <span className="hidden text-sm font-bold text-[var(--editor-fg)] sm:inline">
          {t("nav.homeTitle")}
        </span>
      </Link>

      <nav
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t("nav.appAria")}
      >
        {NAV_ITEMS.map((item) => (
          <NavTab
            key={item.id}
            id={item.id}
            label={t(item.labelKey)}
            icon={item.icon}
            to={item.to}
          />
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <ModelPicker />
        <LocaleSwitcher compact />
        <ThemeSwitcher compact />
        <button
          type="button"
          onClick={openSettings}
          aria-label={t("nav.settings")}
          data-testid="nav-settings"
          className="grid h-11 min-w-11 place-items-center rounded-lg text-[var(--editor-muted)] transition-colors hover:bg-[var(--editor-hover)] hover:text-[var(--editor-fg)]"
        >
          <Settings className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
