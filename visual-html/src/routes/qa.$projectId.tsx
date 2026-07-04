import { createFileRoute } from "@tanstack/react-router";

import { QaPage } from "@/pages/qa-page";

export const Route = createFileRoute("/qa/$projectId")({
  component: QaPage,
});
