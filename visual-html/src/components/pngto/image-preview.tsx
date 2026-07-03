import { useState } from "react";
import { ZoomIn, X } from "lucide-react";

import type { UploadedImage } from "./upload-dropzone";
import { ForensicLightbox } from "./forensic-lightbox";
import { imageBudgetReport } from "@/lib/image-budget";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/download";
import type { GenerationOptions } from "@/types/generation";

const BUDGET_STYLES = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
  heavy:
    "border-red-200 bg-red-50 text-red-900 dark:border-destructive/40 dark:bg-destructive/10 dark:text-destructive-foreground",
} as const;

export function ImagePreview({
  image,
  onRemove,
  options,
  busy,
  onForensicGenerate,
}: {
  image: UploadedImage;
  onRemove: () => void;
  options: GenerationOptions;
  busy?: boolean;
  onForensicGenerate: (nextOptions: GenerationOptions) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const budget = imageBudgetReport(image.file.size, image.width, image.height);

  return (
    <>
      <div className="workspace-panel space-y-3 p-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            title="Open forensic scan"
            aria-label={`Forensic scan: ${image.file.name}`}
            className={cn(
              "group/thumb relative shrink-0 overflow-hidden rounded-md outline-none",
              "transition-transform duration-200 motion-safe:hover:scale-[1.03]",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-workspace-panel",
              "motion-safe:hover:ring-2 motion-safe:hover:ring-primary/40",
            )}
          >
            <img
              src={image.dataUrl}
              alt="Uploaded UI screenshot preview"
              className="h-16 w-16 object-cover"
            />
            <span
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors",
                "motion-safe:group-hover/thumb:bg-black/35",
              )}
              aria-hidden
            >
              <ZoomIn
                className={cn(
                  "h-5 w-5 text-white opacity-0 drop-shadow-md transition-opacity",
                  "motion-safe:group-hover/thumb:opacity-100",
                )}
              />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-workspace-foreground">
              {image.file.name}
            </p>
            <p className="text-xs text-workspace-muted">
              {image.width}×{image.height} · {formatBytes(image.file.size)}
            </p>
            <p className="text-[10px] text-primary">Click thumbnail for forensic scan</p>
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

      <ForensicLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={image.dataUrl}
        alt="Uploaded UI screenshot full size"
        fileName={image.file.name}
        width={image.width}
        height={image.height}
        fileSize={image.file.size}
        options={options}
        busy={busy}
        onGenerate={(next) => onForensicGenerate(next)}
      />
    </>
  );
}
