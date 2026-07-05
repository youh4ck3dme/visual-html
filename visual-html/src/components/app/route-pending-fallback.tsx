import { Skeleton } from "@/components/ui/skeleton";

/** Route-level pending fallback while lazy editor routes load. */
export function RoutePendingFallback() {
  return (
    <div
      className="flex min-h-[50dvh] flex-col gap-3 p-4"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      data-testid="route-pending"
    >
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}
