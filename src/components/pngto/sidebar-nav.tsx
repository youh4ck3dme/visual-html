import { FolderKanban, HelpCircle, Plus, Settings, Sparkles, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "projects", label: "Projects", icon: FolderKanban, disabled: true },
  { id: "new", label: "New", icon: Plus, active: true },
] as const;

const BOTTOM_ITEMS = [
  { id: "support", label: "Support", icon: HelpCircle, disabled: true },
  { id: "settings", label: "Settings", icon: Settings, disabled: true },
  { id: "account", label: "Account", icon: UserRound, disabled: true },
] as const;

export function VisualSidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-[#2a2a31] bg-[#09090b]"
      aria-label="Application navigation"
    >
      <div className="flex h-16 items-center justify-center border-b border-[#2a2a31]">
        <div
          className="grid h-9 w-9 place-items-center rounded-lg bg-[#5b35d5] text-white shadow-sm"
          title="Visual HTML"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const { id, label, icon: Icon } = item;
          const active = "active" in item && item.active;
          const disabled = "disabled" in item && item.disabled;
          return (
          <button
            key={id}
            type="button"
            disabled={disabled && !active}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[10px] font-medium transition-colors",
              active
                ? "bg-[#5b35d5] text-white shadow-sm"
                : "text-[#8b90a0] hover:bg-[#17171a] hover:text-[#c9ccd6]",
              disabled && !active && "cursor-not-allowed opacity-40 hover:bg-transparent",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{label}</span>
          </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-[#2a2a31] px-2 py-4">
        {BOTTOM_ITEMS.map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            aria-label={label}
            className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-medium text-[#8b90a0] transition-colors hover:bg-[#17171a] hover:text-[#c9ccd6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
