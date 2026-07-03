import { ChevronDown, FileUp, Link2, Type, Upload } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";

const MODES = [
  { id: "upload", label: "Upload", icon: Upload, active: true },
  { id: "url", label: "URL", icon: Link2, disabled: true },
  { id: "text", label: "Text", icon: Type, disabled: true },
  { id: "import", label: "Import", icon: FileUp, disabled: true },
] as const;

export function TopCreditBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-shell-border bg-shell/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex-1 px-2 text-center text-[10px] leading-relaxed text-shell-muted sm:text-xs">
          Mistral OCR + Pixtral · Rate limits per IP · Review AI output before shipping
        </p>
        <div className="hidden shrink-0 md:block">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}

export function ModeTabs() {
  return (
    <div
      className="flex items-center gap-1 overflow-x-auto border-b border-workspace-border bg-workspace-tabs px-2 py-2 sm:px-3"
      aria-label="Input mode"
    >
      {MODES.map((mode) => {
        const { id, label, icon: Icon } = mode;
        const active = "active" in mode && mode.active;
        const disabled = "disabled" in mode && mode.disabled;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            disabled={disabled}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-workspace-surface text-workspace-foreground shadow-sm"
                : "text-workspace-muted hover:text-workspace-foreground disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function AppWindow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("workspace-window overflow-hidden text-workspace-foreground", className)}>
      <ModeTabs />
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
  return (
    <details
      className="group rounded-lg border border-workspace-border bg-workspace-surface/70"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-medium text-workspace-muted marker:content-none">
        Advanced generation settings
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-workspace-border px-4 py-4">{children}</div>
    </details>
  );
}
