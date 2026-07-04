import type { FormEvent, ReactNode } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

import { AppLogo } from "@/components/pngto/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

export type EditorPromptBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  busy?: boolean;
  placeholder?: string;
  /** Primary action label (e.g. Generate, Build). Shown on wide submit button variant. */
  submitLabel?: string;
  /** Use textarea instead of single-line input (refinement). */
  multiline?: boolean;
  /** Extra controls above the input (mode tabs, etc.). */
  prefix?: ReactNode;
  testId?: string;
  className?: string;
};

export function EditorPromptBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
  busy = false,
  placeholder,
  submitLabel,
  multiline = false,
  prefix,
  testId = "builder-send",
  className,
}: EditorPromptBarProps) {
  const { t } = useT();
  const resolvedPlaceholder = placeholder ?? t("builder.inputPlaceholder");

  return (
    <form className={cn("space-y-2 p-3 sm:p-4", className)} onSubmit={onSubmit}>
      {prefix}
      <div className="relative flex gap-2">
        {multiline ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || busy}
            placeholder={resolvedPlaceholder}
            rows={2}
            className="min-h-11 flex-1 resize-none bg-[var(--editor-bg)] pr-12"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || busy}
            placeholder={resolvedPlaceholder}
            className="min-h-11 flex-1 bg-[var(--editor-bg)] pr-12"
          />
        )}
        <Button
          type="submit"
          size={submitLabel ? "default" : "icon"}
          className={cn(submitLabel ? "shrink-0 gap-1.5" : "absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2")}
          disabled={submitLabel ? disabled || busy : !value.trim() || disabled || busy}
          data-testid={testId}
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
          ) : submitLabel ? (
            <>
              <AppLogo size="xs" className="rounded-md" />
              {submitLabel}
            </>
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>
    </form>
  );
}
