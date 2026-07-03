import { AlertTriangle } from "lucide-react";

import { useT } from "@/hooks/use-t";

export function PreviewFrame({ srcDoc, allowJs }: { srcDoc: string; allowJs: boolean }) {
  const { t } = useT();
  // sandbox="" => scripts disabled, same-origin denied. allow-scripts only when opted-in;
  // NEVER allow-same-origin, so the frame cannot touch the parent.
  const sandbox = allowJs ? "allow-scripts" : "";
  return (
    <div className="glass-inset overflow-hidden">
      {allowJs && (
        <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-3 py-1.5 text-[11px] text-destructive-foreground">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          {t("result.previewJsWarning")}
        </div>
      )}
      <iframe
        title={t("result.previewFrameTitle")}
        sandbox={sandbox}
        srcDoc={srcDoc}
        className="h-130 w-full bg-white"
      />
    </div>
  );
}
