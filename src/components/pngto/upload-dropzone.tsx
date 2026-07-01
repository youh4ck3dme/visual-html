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
const MAX_IMAGE_DIMENSION = 1600;
const TARGET_UPLOAD_BYTES = 1_800_000;
const WEBP_QUALITIES = [0.9, 0.82, 0.74] as const;

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not read file"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

async function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not process image"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Invalid image"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not optimize image"));
    }, type, quality);
  });
}

function replaceFileExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "upload"}.${ext}`;
}

async function toUploadedImage(file: File, dataUrl?: string): Promise<UploadedImage> {
  const finalDataUrl = dataUrl ?? (await readAsDataUrl(file));
  const img = await loadImage(finalDataUrl);
  const base64 = finalDataUrl.split(",")[1] ?? "";

  return {
    file,
    dataUrl: finalDataUrl,
    base64,
    mimeType: file.type as UploadedImage["mimeType"],
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

async function optimizeUpload(file: File): Promise<UploadedImage> {
  const originalDataUrl = await readAsDataUrl(file);
  const originalImage = await loadImage(originalDataUrl);
  const maxDimension = Math.max(originalImage.naturalWidth, originalImage.naturalHeight);

  if (file.size <= TARGET_UPLOAD_BYTES && maxDimension <= MAX_IMAGE_DIMENSION) {
    return toUploadedImage(file, originalDataUrl);
  }

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / maxDimension);
  const width = Math.max(1, Math.round(originalImage.naturalWidth * scale));
  const height = Math.max(1, Math.round(originalImage.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image for upload");

  ctx.drawImage(originalImage, 0, 0, width, height);

  let bestBlob: Blob | null = null;
  for (const quality of WEBP_QUALITIES) {
    const blob = await canvasToBlob(canvas, "image/webp", quality);
    if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
    if (blob.size <= TARGET_UPLOAD_BYTES) break;
  }

  if (!bestBlob) throw new Error("Could not optimize image");

  const optimizedFile = new File([bestBlob], replaceFileExtension(file.name, "webp"), {
    type: "image/webp",
  });
  const optimizedDataUrl = await readBlobAsDataUrl(bestBlob);

  return toUploadedImage(optimizedFile, optimizedDataUrl);
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
        onFile(await optimizeUpload(file));
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
        className="mt-2 inline-flex items-center rounded-md border border-border bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
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