import { AlertTriangle } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useT } from "@/hooks/use-t";
import type { PreviewConsoleEntry } from "@/lib/preview-console-bridge";
import { cn } from "@/lib/utils";

export type PreviewLightboxProps = {
  open: boolean;
  onClose: () => void;
  srcDoc: string;
  allowJs: boolean;
  title?: string;
  onConsoleEntry?: (entry: PreviewConsoleEntry) => void;
};

export function PreviewLightbox({ open, onClose, srcDoc, allowJs, title }: PreviewLightboxProps) {
  const { t } = useT();
  const sandbox = allowJs ? "allow-scripts" : "";
  const frameTitle = title ?? t("result.previewFrameTitle");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        data-testid="preview-fullscreen-dialog"
        className={cn(
          "flex max-h-[min(92dvh,92vh)] w-[min(92vw,1200px)] max-w-[min(92vw,1200px)] flex-col gap-0 overflow-hidden border-shell-border bg-white p-0",
          "pb-[env(safe-area-inset-bottom,0px)]",
          "duration-300 motion-reduce:duration-0",
          "data-[state=open]:zoom-in-[0.92] data-[state=closed]:zoom-out-[0.92]",
        )}
      >
        <DialogTitle className="sr-only">{t("editor.previewFullscreenTitle")}</DialogTitle>

        {allowJs && (
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-destructive/10 px-3 py-1.5 text-[11px] text-destructive-foreground">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            {t("result.previewJsWarning")}
          </div>
        )}

        <iframe
          title={frameTitle}
          sandbox={sandbox}
          srcDoc={srcDoc}
          className="min-h-[min(72dvh,72vh,900px)] w-full flex-1 bg-white"
          data-testid="preview-fullscreen-iframe"
        />
      </DialogContent>
    </Dialog>
  );
}
