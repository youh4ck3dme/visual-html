import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { NAV_ITEMS, type NavTo } from "@/components/app/nav-config";
import { useSettingsDialog } from "@/components/app/settings-context";
import { AppLogo } from "@/components/pngto/app-logo";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";

function navButtonBaseClass(compact?: boolean) {
  return cn(
    "group relative flex items-center justify-center rounded-lg font-medium transition-colors",
    compact
      ? "h-11 min-w-11 flex-col gap-0.5 px-2 text-[11px] leading-none"
      : "min-h-11 flex-col gap-1 px-2 py-2.5 text-xs",
  );
}

function navButtonStateClass(active: boolean, disabled: boolean) {
  return cn(
    active
      ? "bg-primary/12 font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary/25 dark:bg-primary/25 dark:text-primary-foreground dark:ring-primary/40"
      : "text-shell-muted hover:bg-shell-hover hover:text-foreground",
    disabled && !active && "cursor-not-allowed opacity-40 hover:bg-transparent",
  );
}

function navButtonClass(active: boolean, disabled: boolean, compact?: boolean) {
  return cn(navButtonBaseClass(compact), navButtonStateClass(active, disabled));
}

function NavLink({
  id,
  label,
  icon: Icon,
  to,
  compact = false,
}: {
  id: string;
  label: string;
  icon: (typeof NAV_ITEMS)[number]["icon"];
  to: NavTo;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      data-testid={`nav-${id}`}
      className={navButtonClass(false, false, compact)}
      activeProps={{
        className: navButtonClass(true, false, compact),
        "aria-current": "page" as const,
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

function NavSettingsButton({ compact = false }: { compact?: boolean }) {
  const { t } = useT();
  const { openSettings } = useSettingsDialog();

  return (
    <button
      type="button"
      onClick={openSettings}
      aria-label={t("nav.settings")}
      data-testid="nav-settings"
      className={navButtonClass(false, false, compact)}
    >
      <Settings className="h-4 w-4 shrink-0" aria-hidden />
      {!compact && <span>{t("nav.settings")}</span>}
    </button>
  );
}

export function VisualSidebar() {
  const { t } = useT();

  return (
    <>
      <aside
        className="shell-sidebar-panel fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r md:flex"
        aria-label={t("nav.appAria")}
      >
        <Link
          to="/"
          className="flex h-16 items-center justify-center border-b border-shell-border"
          aria-label={t("nav.homeAria")}
          data-testid="nav-home"
        >
          <AppLogo size="md" shadow title={t("nav.homeTitle")} />
        </Link>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              id={item.id}
              label={t(item.labelKey)}
              icon={item.icon}
              to={item.to}
            />
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-shell-border px-2 py-4">
          <LocaleSwitcher compact />
          <ThemeSwitcher compact />
          <NavSettingsButton />
        </div>
      </aside>

      <nav
        className="shell-sidebar-panel shell-safe-bottom fixed inset-x-0 bottom-0 z-40 flex min-h-[var(--shell-nav-height)] items-center justify-around border-t bg-shell-sidebar/95 px-2 pt-2 backdrop-blur-md md:hidden"
        aria-label={t("nav.mobileAria")}
      >
        <Link
          to="/"
          className="flex items-center justify-center"
          aria-label={t("nav.homeAria")}
          data-testid="nav-home-mobile"
        >
          <AppLogo size="md" />
        </Link>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            id={`${item.id}-mobile`}
            label={t(item.labelKey)}
            icon={item.icon}
            to={item.to}
            compact
          />
        ))}
        <LocaleSwitcher compact />
        <ThemeSwitcher compact />
        <NavSettingsButton compact />
      </nav>
    </>
  );
}
