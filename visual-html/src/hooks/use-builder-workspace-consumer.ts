import { useContext } from "react";

import {
  BuilderWorkspaceContext,
  type BuilderWorkspaceContextValue,
} from "@/hooks/builder-workspace-context";

export function useBuilderWorkspace(): BuilderWorkspaceContextValue {
  const context = useContext(BuilderWorkspaceContext);
  if (!context) {
    throw new Error("useBuilderWorkspace must be used within BuilderWorkspaceProvider");
  }
  return context;
}

/** Safe accessor for global UI (sidebar badge) when provider may be absent in tests. */
export function useBuilderWorkspaceOptional(): BuilderWorkspaceContextValue | null {
  return useContext(BuilderWorkspaceContext);
}
