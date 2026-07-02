import { X } from "lucide-react";
import type { UploadedImage } from "./upload-dropzone";
import { imageBudgetReport } from "@/lib/image-budget";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/download";

export function ImagePreview({ image, onRemove }: { image: UploadedImage; onRemove: () => void }) {
  const budget = imageBudgetReport(image.file.size, image.width, image.height);

  return (
    <div className="glass-inset space-y-3 p-3">
      <div className="flex items-center gap-3">
        <img
          src={image.dataUrl}
          alt="Uploaded UI screenshot preview"
          className="h-16 w-16 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{image.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {image.width}×{image.height} · {formatBytes(image.file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div
        className={cn(
          "rounded-md border px-3 py-2 text-xs",
          budget.status === "good" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
          budget.status === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-100",
          budget.status === "heavy" &&
            "border-destructive/40 bg-destructive/10 text-destructive-foreground",
        )}
      >
        <div className="font-medium">{budget.label}</div>
        <div className="mt-1 text-muted-foreground">{budget.detail}</div>
        <div className="mt-1 text-muted-foreground">{budget.recommendation}</div>
      </div>
    </div>
  );
}
