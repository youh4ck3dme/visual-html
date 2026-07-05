import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SettingsDialog } from "@/components/app/settings-dialog";
import { SettingsProvider } from "@/components/app/settings-context";

export const Route = createFileRoute("/_editor")({
  component: EditorRouteLayout,
});

function EditorRouteLayout() {
  return (
    <SettingsProvider>
      <Outlet />
      <SettingsDialog />
    </SettingsProvider>
  );
}
