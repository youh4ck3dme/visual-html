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

function navButtonClass(active: boolean, disabled: boolean, compact?: boolean) {
  return cn(
    "group relative flex items-center justify-center rounded-lg font-medium transition-colors",
    compact
      ? "h-11 min-w-11 flex-col gap-0.5 px-2 text-[9px]"
      : "flex-col gap-1 px-2 py-2.5 text-[10px]",
    active
      ? "bg-[#5b35d5] text-white shadow-sm"
      : "text-[#8b90a0] hover:bg-[#17171a] hover:text-[#c9ccd6]",
    disabled && !active && "cursor-not-allowed opacity-40 hover:bg-transparent",
  );
}

function NavButton({
  id,
  label,
  icon: Icon,
  active = false,
  disabled = false,
  compact = false,
}: {
  id: string;
  label: string;
  icon: typeof Plus;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      key={id}
      type="button"
      disabled={disabled && !active}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={navButtonClass(active, disabled, compact)}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!compact && <span>{label}</span>}
    </button>
  );
}

export function VisualSidebar() {
  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r border-[#2a2a31] bg-[#09090b] md:flex"
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
            const active = "active" in item && item.active;
            const disabled = "disabled" in item && item.disabled;
            return (
              <NavButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                active={active}
                disabled={disabled}
              />
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-[#2a2a31] px-2 py-4">
          {BOTTOM_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              disabled={item.disabled}
            />
          ))}
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#2a2a31] bg-[#09090b]/95 px-2 py-2 backdrop-blur-sm md:hidden"
        aria-label="Mobile navigation"
      >
        <div
          className="grid h-9 w-9 place-items-center rounded-lg bg-[#5b35d5] text-white"
          aria-hidden
        >
          <Sparkles className="h-4 w-4" />
        </div>
        {NAV_ITEMS.map((item) => {
          const active = "active" in item && item.active;
          const disabled = "disabled" in item && item.disabled;
          return (
            <NavButton
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              active={active}
              disabled={disabled}
              compact
            />
          );
        })}
        <NavButton id="settings" label="Settings" icon={Settings} disabled compact />
      </nav>
    </>
  );
}
