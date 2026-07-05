import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/utils";

type PreviewSkeletonProps = {
  className?: string;
};

/** Full-canvas Apple-style shimmer while generation preview is loading. */
export function PreviewSkeleton({ className }: PreviewSkeletonProps) {
  const { t } = useT();

  return (
    <div
      className={cn(
        "preview-skeleton-canvas relative flex h-full min-h-0 w-full flex-col overflow-hidden p-4 sm:p-6",
        className,
      )}
      data-testid="preview-skeleton"
      role="status"
      aria-live="polite"
      aria-label={t("editor.previewLoadingAria")}
    >
      <div
        className="apple-progress-shimmer pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
      />

      <div className="relative z-1 flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
        <Skeleton className="h-4 w-[45%] shrink-0 rounded-md sm:h-5" />
        <Skeleton className="h-3 w-[28%] shrink-0 rounded-md opacity-70" />

        <Skeleton className="min-h-20 flex-[1.4] rounded-xl" />

        <div className="grid min-h-16 flex-[1.6] grid-cols-2 gap-3">
          <Skeleton className="h-full min-h-0 rounded-xl" />
          <Skeleton className="h-full min-h-0 rounded-xl" />
        </div>

        <div className="grid min-h-12 flex-1 grid-cols-3 gap-2 sm:gap-3">
          <Skeleton className="h-full min-h-0 rounded-lg" />
          <Skeleton className="h-full min-h-0 rounded-lg" />
          <Skeleton className="h-full min-h-0 rounded-lg" />
        </div>

        <Skeleton className="h-10 shrink-0 rounded-lg sm:h-11" />
      </div>
    </div>
  );
}
