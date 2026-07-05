"use client";

import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

export type PipelineStep = { id: string; label: string };

export type PipelineStatus = "running" | "success" | "failed" | "idle";

export type GenerationPipelineCardProps = {
  title: string;
  subtitle?: string;
  progress: number;
  steps: PipelineStep[];
  activeIndex: number;
  status: PipelineStatus;
  progressAriaLabel: string;
  onCancel?: () => void;
  cancelLabel?: string;
  cancelDisabled?: boolean;
  cancelAriaLabel?: string;
  testId?: string;
  className?: string;
};

export function GenerationPipelineCard({
  title,
  subtitle,
  progress,
  steps,
  activeIndex,
  status,
  progressAriaLabel,
  onCancel,
  cancelLabel,
  cancelDisabled = false,
  cancelAriaLabel,
  testId,
  className,
}: GenerationPipelineCardProps) {
  const displayProgress = useAnimatedNumber(progress);
  const showShimmer = status === "running";

  const headerIcon = useMemo(() => {
    if (status === "failed") {
      return <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />;
    }
    if (status === "success") {
      return <Check className="apple-check-pop h-4 w-4 shrink-0 text-primary" aria-hidden />;
    }
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />;
  }, [status]);

  return (
    <div
      className={cn(
        "apple-pipeline-card apple-pipeline-enter space-y-3 px-4 py-3 text-sm",
        className,
      )}
      role="status"
      aria-live="polite"
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {headerIcon}
          <div className="min-w-0 flex-1">
            <div
              key={`${activeIndex}-${title}`}
              className="truncate font-medium text-foreground motion-safe:transition-opacity motion-safe:duration-200"
            >
              {title}
            </div>
            {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
          </div>
        </div>
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="apple-press h-7 shrink-0 px-2 text-[11px]"
            onClick={onCancel}
            disabled={cancelDisabled}
            data-testid="builder-cancel-generation"
            aria-label={cancelAriaLabel}
          >
            <X className="mr-1 h-3 w-3" />
            {cancelLabel}
          </Button>
        ) : (
          <span className="shrink-0 tabular-nums text-foreground">{displayProgress}%</span>
        )}
      </div>

      <Progress
        value={progress}
        variant="apple"
        shimmer={showShimmer}
        aria-label={progressAriaLabel}
      />

      {onCancel ? (
        <div className="text-right text-xs tabular-nums text-muted-foreground">
          {displayProgress}%
        </div>
      ) : null}

      <ol className="space-y-2">
        {steps.map((step, i) => {
          const done = status === "success" || i < activeIndex;
          const active = i === activeIndex && status === "running";
          const failed = i === activeIndex && status === "failed";
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
                active || failed ? "text-foreground" : "text-muted-foreground",
                !done && !active && !failed && "opacity-40",
                failed && "apple-shake",
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center",
                  active && "apple-step-pulse rounded-full ring-2 ring-primary/25",
                )}
              >
                {done ? (
                  <Check className="apple-check-pop h-4 w-4 text-primary" aria-hidden />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                ) : failed ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-current" aria-hidden />
                )}
              </span>
              <span className="truncate">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
