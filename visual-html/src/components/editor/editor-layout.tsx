import type { ReactNode } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useT } from "@/hooks/use-t";
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

function SplitPanels({
  chatPanel,
  previewPanel,
  isMobile,
  promptBar,
}: {
  chatPanel: ReactNode;
  previewPanel: ReactNode;
  isMobile: boolean;
  promptBar?: ReactNode;
}) {
  const { t } = useT();

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <section
          className="editor-preview-mobile flex min-h-0 flex-[0.55] flex-col overflow-hidden border-b border-(--editor-border)"
          data-testid="editor-preview-stage"
          aria-label={t("editor.previewPanelAria")}
        >
          {previewPanel}
        </section>
        <section
          className="editor-chat-mobile flex min-h-0 flex-[0.45] flex-col overflow-hidden"
          data-testid="editor-chat-panel"
          aria-label={t("editor.chatPanelAria")}
        >
          {chatPanel}
        </section>
        {promptBar && (
          <div
            className="editor-prompt-bar shrink-0 border-t border-(--editor-border) bg-(--editor-panel) pb-[max(0.5rem,var(--editor-safe-bottom))]"
            data-testid="editor-prompt-bar"
          >
            {promptBar}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <section
        className={cn(
          "editor-chat-desktop flex w-(--editor-chat-width) min-w-(--editor-chat-min) max-w-(--editor-chat-max)",
          "shrink-0 flex-col overflow-hidden border-r border-(--editor-border) bg-(--editor-panel)",
        )}
        data-testid="editor-chat-panel"
        aria-label={t("editor.chatPanelAria")}
      >
        {chatPanel}
      </section>
      <section
        className="editor-preview-desktop flex min-w-0 flex-1 flex-col overflow-hidden bg-(--editor-bg)"
        data-testid="editor-preview-stage"
        aria-label={t("editor.previewPanelAria")}
      >
        {previewPanel}
      </section>
    </div>
  );
}

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
        "editor-layout flex h-dvh max-h-dvh flex-col overflow-hidden bg-(--editor-bg) text-(--editor-fg)",
        className,
      )}
      data-testid={studioMode ? "builder-mobile-studio" : "editor-layout"}
    >
      <EditorHeader />
      {topBar}
      <main id="main-content" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {hasSplit ? (
          <SplitPanels
            chatPanel={chatPanel}
            previewPanel={previewPanel}
            isMobile={isMobile}
            promptBar={promptBar}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-clip">{children}</div>
        )}
      </main>
    </div>
  );
}
