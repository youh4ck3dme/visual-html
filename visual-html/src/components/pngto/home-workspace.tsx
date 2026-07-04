import { ChevronDown, FileUp, Link2, Type, Upload } from "lucide-react";
import type { ReactNode } from "react";

import { useT } from "@/hooks/use-t";
import type { InputMode } from "@/lib/input-mode";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";

const MODES = [
  { id: "upload" as const, labelKey: "mode.upload" as MessageKey, icon: Upload },
  { id: "url" as const, labelKey: "mode.url" as MessageKey, icon: Link2 },
  { id: "text" as const, labelKey: "mode.text" as MessageKey, icon: Type },
  { id: "import" as const, labelKey: "mode.import" as MessageKey, icon: FileUp },
];

export function TopCreditBar() {
  const { t } = useT();

  return (
    <div className="sticky top-0 z-30 border-b border-shell-border bg-shell/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex-1 px-2 text-center text-[10px] leading-relaxed text-shell-muted sm:text-xs">
          {t("topbar.credit")}
        </p>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}

export function ModeTabs({
  value,
  onChange,
}: {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}) {
  const { t } = useT();

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto border-b border-workspace-border bg-workspace-tabs px-2 py-2 sm:px-3"
      aria-label={t("mode.groupAria")}
      role="tablist"
    >
      {MODES.map((mode) => {
        const { id, labelKey, icon: Icon } = mode;
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            data-testid={`input-mode-${id}`}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-workspace-surface text-workspace-foreground shadow-sm"
                : "text-workspace-muted hover:bg-workspace-surface/60 hover:text-workspace-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}

export function AppWindow({
  children,
  className,
  mode,
  onModeChange,
}: {
  children: ReactNode;
  className?: string;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}) {
  return (
    <div className={cn("workspace-window overflow-hidden text-workspace-foreground", className)}>
      <ModeTabs value={mode} onChange={onModeChange} />
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function AdvancedSettings({
  children,
  defaultOpen = false,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const { t } = useT();

  return (
    <details
      className="group rounded-lg border border-workspace-border bg-workspace-surface/70"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-medium text-workspace-muted marker:content-none">
        {t("advancedSettings.summary")}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-workspace-border px-4 py-4">{children}</div>
    </details>
  );
}
