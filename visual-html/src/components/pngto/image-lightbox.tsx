import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/download";

export type ImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  fileName?: string;
  width?: number;
  height?: number;
  fileSize?: number;
};

export function ImageLightbox({
  open,
  onClose,
  src,
  alt,
  fileName,
  width,
  height,
  fileSize,
}: ImageLightboxProps) {
  const metaParts = [
    fileName,
    width && height ? `${width}×${height}` : null,
    fileSize != null ? formatBytes(fileSize) : null,
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        aria-describedby={metaParts.length ? "image-lightbox-meta" : undefined}
        className={cn(
          "max-h-[92vh] w-[min(92vw,1200px)] max-w-[min(92vw,1200px)] gap-0 overflow-hidden border-shell-border bg-shell p-0",
          "duration-300 motion-reduce:duration-0",
          "data-[state=open]:zoom-in-[0.92] data-[state=closed]:zoom-out-[0.92]",
        )}
      >
        <DialogTitle className="sr-only">{fileName || alt}</DialogTitle>
        {metaParts.length > 0 && (
          <DialogDescription id="image-lightbox-meta" className="sr-only">
            {metaParts.join(" · ")}
          </DialogDescription>
        )}

        <div className="flex max-h-[calc(92vh-3.5rem)] flex-col">
          <div className="flex items-center justify-center bg-black/90 p-3 sm:p-5">
            <img
              src={src}
              alt={alt}
              className={cn(
                "max-h-[min(72vh,900px)] max-w-full object-contain",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300",
                "motion-reduce:animate-none",
              )}
            />
          </div>

          {metaParts.length > 0 && (
            <div className="border-t border-shell-border px-4 py-3 text-center text-xs text-shell-muted sm:text-sm">
              <p className="truncate font-medium text-foreground">{fileName}</p>
              <p className="mt-0.5">
                {width && height ? `${width}×${height}` : null}
                {width && height && fileSize != null ? " · " : null}
                {fileSize != null ? formatBytes(fileSize) : null}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
