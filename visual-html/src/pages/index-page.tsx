import { getRouteApi } from "@tanstack/react-router";

import { EditorModeScreenshot } from "@/components/editor/editor-mode-screenshot";

const indexRouteApi = getRouteApi("/");

export function IndexPage() {
  const { project: projectId } = indexRouteApi.useSearch();
  return <EditorModeScreenshot projectId={projectId} />;
}
