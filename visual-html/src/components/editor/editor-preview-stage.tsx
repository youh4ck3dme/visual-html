import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type EditorPreviewStageProps = {
  children: ReactNode;
  toolbar?: ReactNode;
  console?: ReactNode;
  className?: string;
};

export function EditorPreviewStage({
  children,
  toolbar,
  console,
  className,
}: EditorPreviewStageProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      {toolbar && (
        <div className="shrink-0 border-b border-(--editor-border) px-3 py-2">{toolbar}</div>
      )}
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      {console}
    </div>
  );
}
