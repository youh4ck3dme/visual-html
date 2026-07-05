import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PreviewSkeletonProps = {
  className?: string;
};

/** Apple-style shimmer placeholder while generation preview is loading. */
export function PreviewSkeleton({ className }: PreviewSkeletonProps) {
  return (
    <div
      className={cn("flex w-full flex-col gap-3 p-4", className)}
      data-testid="preview-skeleton"
      aria-hidden
    >
      <Skeleton className="h-4 w-[66%] rounded-md bg-primary/10" />
      <Skeleton className="h-24 w-full rounded-lg bg-primary/10" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-16 rounded-lg bg-primary/10" />
        <Skeleton className="h-16 rounded-lg bg-primary/10" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg bg-primary/10 apple-shimmer relative overflow-hidden" />
    </div>
  );
}
