import { useState } from "react";
import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-t";
import type { PreviewConsoleEntry } from "@/lib/preview-console-bridge";
import { cn } from "@/lib/utils";

export type EditorConsolePanelProps = {
  entries: PreviewConsoleEntry[];
  onClear?: () => void;
  onFixWithAi?: (message: string) => void;
  allowFix?: boolean;
  className?: string;
};

export function EditorConsolePanel({
  entries,
  onClear,
  onFixWithAi,
  allowFix = true,
  className,
}: EditorConsolePanelProps) {
  const { t } = useT();
  const [open, setOpen] = useState(true);
  const lastError = [...entries].reverse().find((e) => e.level === "error");

  return (
    <div
      className={cn("flex flex-col bg-(--editor-bg) text-xs", className)}
      data-testid="editor-console"
    >
      <button
        type="button"
        className="flex min-h-11 items-center justify-between px-3 py-2 text-left font-medium text-shell-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{t("editor.console")}</span>
        <span>{entries.length}</span>
      </button>
      {open ? (
        <div className="max-h-32 overflow-y-auto border-t border-(--editor-border) font-mono">
          {entries.length === 0 ? (
            <p className="p-3 text-shell-muted">{t("editor.consoleEmpty")}</p>
          ) : (
            <>
              {onClear && (
                <div className="flex justify-end border-b border-(--editor-border) p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onClear}
                    data-testid="editor-console-clear"
                  >
                    Clear
                  </Button>
                </div>
              )}
              {entries.slice(-50).map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    "border-b border-(--editor-border) px-3 py-1",
                    e.level === "error" && "text-destructive",
                    e.level === "warn" && "text-amber-500",
                  )}
                >
                  [{e.level}] {e.args.join(" ")}
                </div>
              ))}
            </>
          )}
        </div>
      ) : null}
      {allowFix && lastError && onFixWithAi ? (
        <div className="border-t border-(--editor-border) p-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full gap-2"
            onClick={() => onFixWithAi(lastError.args.join(" "))}
            data-testid="editor-fix-with-ai"
          >
            <Wrench className="h-3.5 w-3.5" aria-hidden />
            {t("editor.fixWithAi")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
