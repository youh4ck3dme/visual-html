import { AlertTriangle } from "lucide-react";

import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

type PreviewFrameProps = {
  srcDoc: string;
  allowJs: boolean;
  title?: string;
  className?: string;
};

export function PreviewFrame({ srcDoc, allowJs, title, className }: PreviewFrameProps) {
  const { t } = useT();
  // sandbox="" => scripts disabled, same-origin denied. allow-scripts only when opted-in;
  // NEVER allow-same-origin, so the frame cannot touch the parent.
  const sandbox = allowJs ? "allow-scripts" : "";
  return (
    <div className={cn("glass-inset flex min-h-0 flex-col overflow-hidden", className)}>
      {allowJs && (
        <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-3 py-1.5 text-[11px] text-destructive-foreground">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          {t("result.previewJsWarning")}
        </div>
      )}
      <iframe
        title={title ?? t("result.previewFrameTitle")}
        sandbox={sandbox}
        srcDoc={srcDoc}
        className="min-h-0 w-full flex-1 bg-white"
        data-testid="preview-frame-iframe"
      />
    </div>
  );
}
