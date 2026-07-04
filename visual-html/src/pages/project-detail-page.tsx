import { getRouteApi } from "@tanstack/react-router";

import { EditorModeProjects } from "@/components/editor/editor-mode-projects";

const projectDetailRouteApi = getRouteApi("/projects/$projectId");

export function ProjectDetailPage() {
  const { projectId } = projectDetailRouteApi.useParams();
  return <EditorModeProjects initialProjectId={projectId} />;
}
