import { ChevronDown, FileUp, Link2, Type, Upload } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const MODES = [
  { id: "upload", label: "Upload", icon: Upload, active: true },
  { id: "url", label: "URL", icon: Link2, disabled: true },
  { id: "text", label: "Text", icon: Type, disabled: true },
  { id: "import", label: "Import", icon: FileUp, disabled: true },
] as const;

export function TopCreditBar() {
  return (
    <div className="sticky top-0 z-30 border-b border-[#2a2a31] bg-[#030303]/95 px-6 py-3 backdrop-blur-sm">
      <p className="text-center text-xs text-[#8b90a0]">
        Mistral OCR + Pixtral synthesis · Per-IP rate limits apply · Review AI output before
        shipping
      </p>
    </div>
  );
}

export function ModeTabs() {
  return (
    <div
      className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-100/80 px-3 py-2"
      role="tablist"
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
          role="tab"
          aria-selected={active}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40",
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
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/80 bg-[#f7f8fa] text-zinc-900 shadow-2xl shadow-black/40",
        className,
      )}
    >
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
    <details className="group rounded-lg border border-zinc-200 bg-white/70" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-medium text-zinc-600 marker:content-none">
        Advanced generation settings
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-zinc-200 px-4 py-4">{children}</div>
    </details>
  );
}
