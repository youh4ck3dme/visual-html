import { createFileRoute } from "@tanstack/react-router";

import { ExportPage } from "@/pages/export-page";

export const Route = createFileRoute("/export/$projectId")({
  component: ExportPage,
});
