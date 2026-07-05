import { useParams } from "@tanstack/react-router";

import { EditorModeProjects } from "@/components/editor/editor-mode-projects";

export function ProjectDetailPage() {
  const { projectId } = useParams({ strict: false }) as { projectId?: string };
  return <EditorModeProjects initialProjectId={projectId} />;
}
