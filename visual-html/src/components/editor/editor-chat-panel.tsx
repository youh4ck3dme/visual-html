import type { ReactNode, RefObject } from "react";

import { cn } from "@/lib/utils";

export type EditorChatPanelProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
};

export function EditorChatPanel({
  header,
  footer,
  children,
  className,
  scrollRef,
}: EditorChatPanelProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {header && (
        <div className="shrink-0 border-b border-[var(--editor-border)] px-3 py-2">{header}</div>
      )}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-clip px-3 py-3">
        {children}
      </div>
      {footer && (
        <div className="shrink-0 border-t border-[var(--editor-border)] bg-[var(--editor-panel)]">
          {footer}
        </div>
      )}
    </div>
  );
}
