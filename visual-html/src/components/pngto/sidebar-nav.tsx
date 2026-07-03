import { Link } from "@tanstack/react-router";
import { FolderKanban, HelpCircle, Plus, Settings, Sparkles, UserRound, Wand2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";

const NAV_ITEMS = [
  { id: "projects", label: "Projects", icon: FolderKanban, to: "/projects" as const },
  { id: "new", label: "New", icon: Plus, to: "/" as const },
  { id: "builder", label: "VibeCraft", icon: Wand2, to: "/builder" as const },
] as const;

const BOTTOM_ITEMS = [
  { id: "support", label: "Support", icon: HelpCircle, disabled: true },
  { id: "settings", label: "Settings", icon: Settings, disabled: true },
  { id: "account", label: "Account", icon: UserRound, disabled: true },
] as const;

type NavTo = "/" | "/projects" | "/builder";

function navButtonClass(active: boolean, disabled: boolean, compact?: boolean) {
  return cn(
    "group relative flex items-center justify-center rounded-lg font-medium transition-colors",
    compact
      ? "h-11 min-w-11 flex-col gap-0.5 px-2 text-[9px]"
      : "flex-col gap-1 px-2 py-2.5 text-[10px]",
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-shell-muted hover:bg-shell-hover hover:text-foreground",
    disabled && !active && "cursor-not-allowed opacity-40 hover:bg-transparent",
  );
}

function NavLink({
  label,
  icon: Icon,
  to,
  compact = false,
}: {
  label: string;
  icon: typeof Plus;
  to: NavTo;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={navButtonClass(false, false, compact)}
      activeProps={{
        className: navButtonClass(true, false, compact),
        "aria-current": "page",
      }}
      inactiveProps={{
        className: navButtonClass(false, false, compact),
      }}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!compact && <span>{label}</span>}
    </Link>
  );
}

function NavButton({
  label,
  icon: Icon,
  disabled = false,
  compact = false,
}: {
  label: string;
  icon: typeof Plus;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      className={navButtonClass(false, disabled, compact)}
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
        className="shell-sidebar-panel fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r md:flex"
        aria-label="Application navigation"
      >
        <Link
          to="/"
          className="flex h-16 items-center justify-center border-b border-shell-border"
          aria-label="PNGtoHTML home"
        >
          <div
            className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            title="PNGtoHTML"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.id} label={item.label} icon={item.icon} to={item.to} />
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-shell-border px-2 py-4">
          <ThemeSwitcher compact />
          {BOTTOM_ITEMS.map((item) => (
            <NavButton key={item.id} label={item.label} icon={item.icon} disabled={item.disabled} />
          ))}
        </div>
      </aside>

      <nav
        className="shell-sidebar-panel fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t bg-shell-sidebar/95 px-2 py-2 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <Link
          to="/"
          className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"
          aria-label="PNGtoHTML home"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
        </Link>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.id} label={item.label} icon={item.icon} to={item.to} compact />
        ))}
        <ThemeSwitcher compact />
      </nav>
    </>
  );
}
