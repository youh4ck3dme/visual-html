import { X } from "lucide-react";
import type { UploadedImage } from "./upload-dropzone";
import { imageBudgetReport } from "@/lib/image-budget";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/download";

const BUDGET_STYLES = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
  heavy:
    "border-red-200 bg-red-50 text-red-900 dark:border-destructive/40 dark:bg-destructive/10 dark:text-destructive-foreground",
} as const;

export function ImagePreview({ image, onRemove }: { image: UploadedImage; onRemove: () => void }) {
  const budget = imageBudgetReport(image.file.size, image.width, image.height);

  return (
    <div className="workspace-panel space-y-3 p-3">
      <div className="flex items-center gap-3">
        <img
          src={image.dataUrl}
          alt="Uploaded UI screenshot preview"
          className="h-16 w-16 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-workspace-foreground">
            {image.file.name}
          </p>
          <p className="text-xs text-workspace-muted">
            {image.width}×{image.height} · {formatBytes(image.file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="grid h-8 w-8 place-items-center rounded-md text-workspace-muted hover:bg-workspace-tabs hover:text-workspace-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className={cn("rounded-md border px-3 py-2 text-xs", BUDGET_STYLES[budget.status])}>
        <div className="font-medium">{budget.label}</div>
        <div className="mt-1 text-current/70">{budget.detail}</div>
        <div className="mt-1 text-current/70">{budget.recommendation}</div>
      </div>
    </div>
  );
}
