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
  /** When set, shows error styling on the form. */
  error?: boolean;
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
  error = false,
  placeholder,
  submitLabel,
  multiline = false,
  prefix,
  testId = "builder-send",
  className,
}: EditorPromptBarProps) {
  const { t } = useT();
  const resolvedPlaceholder = placeholder ?? t("builder.inputPlaceholder");

  const inputAriaLabel = multiline ? t("builder.inputPlaceholder") : t("builder.inputPlaceholder");
  const fieldClassName = "min-h-11 flex-1 bg-(--editor-bg) pr-12";

  return (
    <form
      className={cn(
        "space-y-2 p-3 sm:p-4",
        error && "rounded-lg border border-destructive/40 bg-destructive/5",
        className,
      )}
      onSubmit={onSubmit}
      aria-busy={busy || undefined}
    >
      {prefix}
      <div className="relative flex gap-2">
        {multiline ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || busy}
            placeholder={resolvedPlaceholder}
            aria-label={inputAriaLabel}
            rows={2}
            className={cn(fieldClassName, "resize-none")}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || busy}
            placeholder={resolvedPlaceholder}
            aria-label={inputAriaLabel}
            className={fieldClassName}
          />
        )}
        <Button
          type="submit"
          size={submitLabel ? "default" : "icon"}
          className={cn(
            "apple-press",
            submitLabel
              ? "shrink-0 gap-1.5 min-h-11"
              : "absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2",
          )}
          disabled={submitLabel ? disabled || busy : !value.trim() || disabled || busy}
          aria-label={submitLabel ?? t("builder.action.sendPrompt")}
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
