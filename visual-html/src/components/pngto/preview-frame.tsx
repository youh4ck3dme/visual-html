import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { useT } from "@/hooks/use-t";
import {
  injectConsoleBridge,
  normalizePreviewConsoleMessage,
  type PreviewConsoleEntry,
} from "@/lib/preview-console-bridge";
import { cn } from "@/lib/utils";

type PreviewFrameProps = {
  srcDoc: string;
  allowJs: boolean;
  title?: string;
  className?: string;
  onConsoleEntry?: (entry: PreviewConsoleEntry) => void;
};

export function PreviewFrame({
  srcDoc,
  allowJs,
  title,
  className,
  onConsoleEntry,
}: PreviewFrameProps) {
  const { t } = useT();
  const sandbox = allowJs ? "allow-scripts" : "";
  const [frameReady, setFrameReady] = useState(false);

  const resolvedDoc = useMemo(
    () => (allowJs && onConsoleEntry ? injectConsoleBridge(srcDoc) : srcDoc),
    [allowJs, onConsoleEntry, srcDoc],
  );

  useEffect(() => {
    setFrameReady(false);
  }, [resolvedDoc, allowJs]);

  useEffect(() => {
    if (!allowJs || !onConsoleEntry) return;
    const handler = (event: MessageEvent) => {
      const entry = normalizePreviewConsoleMessage(event.data);
      if (entry) onConsoleEntry(entry);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [allowJs, onConsoleEntry]);

  return (
    <div className={cn("glass-inset flex min-h-0 flex-col overflow-hidden", className)}>
      {allowJs && (
        <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-3 py-1.5 text-[11px] text-destructive-foreground">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          {t("result.previewJsWarning")}
        </div>
      )}
      <div className="relative min-h-[240px] flex-1">
        {!frameReady && (
          <div
            className="absolute inset-0 animate-pulse bg-muted/30"
            role="status"
            aria-label={t("editor.previewLoadingAria")}
            data-testid="preview-frame-loading"
          />
        )}
        <iframe
          title={title ?? t("result.previewFrameTitle")}
          sandbox={sandbox}
          srcDoc={resolvedDoc}
          onLoad={() => setFrameReady(true)}
          className="min-h-[240px] w-full flex-1 bg-white"
          data-testid="preview-frame-iframe"
        />
      </div>
    </div>
  );
}
