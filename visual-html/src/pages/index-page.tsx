import { useSearch } from "@tanstack/react-router";

import { EditorModeScreenshot } from "@/components/editor/editor-mode-screenshot";

export function IndexPage() {
  const { project: projectId } = useSearch({ strict: false }) as { project?: string };
  return <EditorModeScreenshot projectId={projectId} />;
}
