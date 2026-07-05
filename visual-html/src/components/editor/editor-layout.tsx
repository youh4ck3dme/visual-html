import type { ReactNode } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { EditorHeader } from "./editor-header";

export type EditorLayoutProps = {
  /** Left / chat column (upload, chat, project list). */
  chatPanel?: ReactNode;
  /** Right / preview column. */
  previewPanel?: ReactNode;
  /** Full-width fallback when split panels are not used. */
  children?: ReactNode;
  /** Optional strip below header (e.g. credit bar). */
  topBar?: ReactNode;
  /** Fixed bottom prompt strip (mobile stack). */
  promptBar?: ReactNode;
  className?: string;
  /** Marks studio routes for test selectors. */
  studioMode?: boolean;
};

export function EditorLayout({
  chatPanel,
  previewPanel,
  children,
  topBar,
  promptBar,
  className,
  studioMode = false,
}: EditorLayoutProps) {
  const isMobile = useIsMobile();
  const hasSplit = Boolean(chatPanel && previewPanel);

  return (
    <div
      className={cn(
        "editor-layout flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--editor-bg)] text-[var(--editor-fg)]",
        className,
      )}
      data-testid={studioMode ? "builder-mobile-studio" : "editor-layout"}
      data-studio-mode={studioMode ? "" : undefined}
    >
      <EditorHeader />
      {topBar}
      <main id="main-content" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {hasSplit ? (
          isMobile ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <section
                className="editor-preview-mobile flex min-h-0 flex-[0.55] flex-col overflow-hidden border-b border-[var(--editor-border)]"
                data-testid="editor-preview-stage"
              >
                {previewPanel}
              </section>
              <section
                className="editor-chat-mobile flex min-h-0 flex-1 flex-col overflow-hidden"
                data-testid="editor-chat-panel"
              >
                {chatPanel}
              </section>
              {promptBar && (
                <div
                  className="editor-prompt-bar shrink-0 border-t border-[var(--editor-border)] bg-[var(--editor-panel)] pb-[env(safe-area-inset-bottom,0px)]"
                  data-testid="editor-prompt-bar"
                >
                  {promptBar}
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <section
                className="editor-chat-desktop flex w-[var(--editor-chat-width)] min-w-[var(--editor-chat-min)] max-w-[var(--editor-chat-max)] shrink-0 flex-col overflow-hidden border-r border-[var(--editor-border)] bg-[var(--editor-panel)]"
                data-testid="editor-chat-panel"
              >
                {chatPanel}
              </section>
              <section
                className="editor-preview-desktop flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--editor-bg)]"
                data-testid="editor-preview-stage"
              >
                {previewPanel}
              </section>
            </div>
          )
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-clip">{children}</div>
        )}
      </main>
    </div>
  );
}
