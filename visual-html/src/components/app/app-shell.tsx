import type { ReactNode } from "react";

import { VisualSidebar } from "@/components/pngto/sidebar-nav";
import { cn } from "@/lib/utils";

import { SettingsDialog } from "./settings-dialog";
import { SettingsProvider } from "./settings-context";

type AppShellProps = {
  children: ReactNode;
  /** Optional slot above main content (e.g. TopCreditBar). */
  topBar?: ReactNode;
  /** Extra classes on the outer visual-shell wrapper. */
  className?: string;
  /** Extra classes on the main content column. */
  contentClassName?: string;
};

export function AppShell({ children, topBar, className, contentClassName }: AppShellProps) {
  return (
    <SettingsProvider>
      <div className={cn("visual-shell min-h-dvh overflow-x-clip", className)}>
        <VisualSidebar />
        <div
          className={cn(
            "shell-mobile-pad min-h-dvh min-w-0 overflow-x-clip md:pl-16 md:pb-0",
            contentClassName,
          )}
        >
          {topBar}
          {children}
        </div>
      </div>
      <SettingsDialog />
    </SettingsProvider>
  );
}

export { useSettingsDialog } from "./settings-context";
