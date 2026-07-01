import { X } from "lucide-react";
import type { UploadedImage } from "./upload-dropzone";
import { formatBytes } from "@/lib/utils/download";

export function ImagePreview({
  image,
  onRemove,
}: {
  image: UploadedImage;
  onRemove: () => void;
}) {
  return (
    <div className="glass-inset flex items-center gap-3 p-3">
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
  );
}