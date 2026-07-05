import { FolderKanban, ImageIcon, Wand2 } from "lucide-react";

import type { MessageKey } from "@/lib/i18n/messages";

export type NavTo = "/" | "/projects" | "/builder";

export type NavItem = {
  id: string;
  labelKey: MessageKey;
  icon: typeof FolderKanban;
  to: NavTo;
};

/** Single source of truth for primary app navigation. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: "projects",
    labelKey: "nav.projects",
    icon: FolderKanban,
    to: "/projects",
  },
  {
    id: "screenshot",
    labelKey: "nav.new",
    icon: ImageIcon,
    to: "/",
  },
  {
    id: "studio",
    labelKey: "nav.builder",
    icon: Wand2,
    to: "/builder",
  },
] as const;
