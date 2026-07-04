import { Link } from "@tanstack/react-router";
import { FolderKanban, HelpCircle, Plus, Settings, UserRound, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { AppLogo } from "@/components/pngto/app-logo";
import { useBuilderWorkspaceOptional } from "@/hooks/use-builder-workspace-consumer";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";

const NAV_ITEMS = [
  {
    id: "projects",
    labelKey: "nav.projects" as MessageKey,
    icon: FolderKanban,
    to: "/projects" as const,
  },
  { id: "new", labelKey: "nav.new" as MessageKey, icon: Plus, to: "/" as const },
  { id: "builder", labelKey: "nav.builder" as MessageKey, icon: Wand2, to: "/builder" as const },
] as const;

const BOTTOM_ITEMS = [
  { id: "support", labelKey: "nav.support" as MessageKey, icon: HelpCircle },
  { id: "settings", labelKey: "nav.settings" as MessageKey, icon: Settings },
  { id: "account", labelKey: "nav.account" as MessageKey, icon: UserRound },
] as const;

type NavTo = "/" | "/projects" | "/builder";

function navButtonBaseClass(compact?: boolean) {
  return cn(
    "group relative flex items-center justify-center rounded-lg font-medium transition-colors",
    compact
      ? "h-11 min-w-11 flex-col gap-0.5 px-2 text-[9px]"
      : "flex-col gap-1 px-2 py-2.5 text-[10px]",
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
  showGeneratingBadge = false,
}: {
  id: string;
  label: string;
  icon: typeof Plus;
  to: NavTo;
  compact?: boolean;
  showGeneratingBadge?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      data-testid={`nav-${id}`}
      className={cn(navButtonClass(false, false, compact), "relative")}
      activeProps={{
        className: cn(navButtonClass(true, false, compact), "relative"),
        "aria-current": "page" as const,
      }}
      inactiveProps={{
        className: cn(navButtonClass(false, false, compact), "relative"),
      }}
    >
      {showGeneratingBadge && (
        <span
          className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-primary"
          data-testid="nav-builder-generating-badge"
          aria-hidden
        />
      )}
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!compact && <span>{label}</span>}
    </Link>
  );
}

function NavPlaceholderButton({
  id,
  label,
  icon: Icon,
  onComingSoon,
  compact = false,
}: {
  id: string;
  label: string;
  icon: typeof Plus;
  onComingSoon: () => void;
  compact?: boolean;
}) {
  const { t } = useT();

  return (
    <button
      type="button"
      onClick={onComingSoon}
      title={t("nav.comingSoon")}
      aria-label={label}
      data-testid={`nav-${id}`}
      className={navButtonClass(false, false, compact)}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {!compact && <span>{label}</span>}
    </button>
  );
}

export function VisualSidebar() {
  const { t } = useT();
  const builderWorkspace = useBuilderWorkspaceOptional();
  const builderGenerating = builderWorkspace?.isGenerating ?? false;

  const showComingSoon = () => {
    toast.info(t("nav.comingSoon"));
  };

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
              showGeneratingBadge={item.id === "builder" && builderGenerating}
            />
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-shell-border px-2 py-4">
          <LocaleSwitcher compact />
          <ThemeSwitcher compact />
          {BOTTOM_ITEMS.map((item) => (
            <NavPlaceholderButton
              key={item.id}
              id={item.id}
              label={t(item.labelKey)}
              icon={item.icon}
              onComingSoon={showComingSoon}
            />
          ))}
        </div>
      </aside>

      <nav
        className="shell-sidebar-panel fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t bg-shell-sidebar/95 px-2 py-2 backdrop-blur-md md:hidden"
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
            showGeneratingBadge={item.id === "builder" && builderGenerating}
          />
        ))}
        <LocaleSwitcher compact />
        <ThemeSwitcher compact />
      </nav>
    </>
  );
}
