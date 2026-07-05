import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Maximize2 } from "lucide-react";

import { PreviewLightbox } from "@/components/pngto/preview-lightbox";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const resolvedDoc = useMemo(
    () => (allowJs && onConsoleEntry ? injectConsoleBridge(srcDoc) : srcDoc),
    [allowJs, onConsoleEntry, srcDoc],
  );

  const hasPreviewContent = resolvedDoc.trim().length > 0;
  const showExpand = hasPreviewContent && frameReady;

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
        {showExpand && (
          <button
            type="button"
            className="absolute top-2 right-2 z-20 grid min-h-11 min-w-11 place-items-center rounded-lg border border-black/10 bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={t("editor.previewExpandFullscreen")}
            data-testid="preview-expand-fullscreen"
            onClick={() => setLightboxOpen(true)}
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
        )}
        <iframe
          title={title ?? t("result.previewFrameTitle")}
          sandbox={sandbox}
          srcDoc={resolvedDoc}
          onLoad={() => setFrameReady(true)}
          className="min-h-[240px] w-full flex-1 bg-white"
          data-testid="preview-frame-iframe"
        />
        <PreviewLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          srcDoc={resolvedDoc}
          allowJs={allowJs}
          title={title}
        />
      </div>
    </div>
  );
}
