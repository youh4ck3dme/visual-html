import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { ALLOWED_MIME, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/validation/generation";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  file: File;
  dataUrl: string;
  base64: string;
  mimeType: (typeof ALLOWED_MIME)[number];
  width: number;
  height: number;
}

const ALLOWED = ALLOWED_MIME as readonly string[];

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not read file"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

function imageDims(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Invalid image"));
    img.src = src;
  });
}

export function UploadDropzone({
  onFile,
  onError,
}: {
  onFile: (img: UploadedImage) => void;
  onError: (msg: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!ALLOWED.includes(file.type)) {
        onError("Unsupported format. Use PNG, JPG, or WebP.");
        return;
      }
      if (file.size === 0) {
        onError("File is empty.");
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        onError(`File exceeds ${MAX_UPLOAD_MB} MB.`);
        return;
      }
      try {
        const dataUrl = await readAsDataUrl(file);
        const { width, height } = await imageDims(dataUrl);
        const base64 = dataUrl.split(",")[1] ?? "";
        onFile({
          file,
          dataUrl,
          base64,
          mimeType: file.type as UploadedImage["mimeType"],
          width,
          height,
        });
      } catch (e) {
        onError((e as Error).message);
      }
    },
    [onError, onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handle(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "glass-inset flex flex-col items-center justify-center gap-3 px-6 py-12 text-center transition-colors",
        dragging && "border-primary/70 bg-primary/5",
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary">
        <Upload className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Drop a UI screenshot here</p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, or WebP · up to {MAX_UPLOAD_MB} MB
        </p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex items-center rounded-md border border-border bg-surface-strong px-3 py-1.5 text-xs font-medium hover:bg-white/10"
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}