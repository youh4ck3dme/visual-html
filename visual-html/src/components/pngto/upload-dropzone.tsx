import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { useT } from "@/hooks/use-t";
import {
  HARD_AI_IMAGE_BYTES,
  IDEAL_AI_IMAGE_BYTES,
  MAX_AI_IMAGE_DIMENSION,
} from "@/lib/image-budget";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/validation/generation";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

export interface UploadedImage {
  file: File;
  dataUrl: string;
  base64: string;
  mimeType: (typeof ALLOWED_MIME)[number];
  width: number;
  height: number;
}

const ALLOWED = ALLOWED_MIME as readonly string[];
const TARGET_UPLOAD_BYTES = IDEAL_AI_IMAGE_BYTES;
const WEBP_QUALITIES = [0.88, 0.78, 0.68, 0.58, 0.48] as const;

const ERROR_MESSAGE_KEYS: Record<string, MessageKey> = {
  "Could not read file": "upload.error.couldNotRead",
  "Could not process image": "upload.error.couldNotProcess",
  "Invalid image": "upload.error.invalidImage",
  "Could not optimize image": "upload.error.couldNotOptimize",
  "Could not prepare image for upload": "upload.error.couldNotPrepare",
};

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
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Could not optimize image"));
      },
      type,
      quality,
    );
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

  if (file.size <= TARGET_UPLOAD_BYTES && maxDimension <= 1400) {
    return toUploadedImage(file, originalDataUrl);
  }

  const scale = Math.min(1, MAX_AI_IMAGE_DIMENSION / maxDimension);
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

  if (bestBlob && bestBlob.size > HARD_AI_IMAGE_BYTES) {
    const aggressiveScale = Math.min(1, Math.sqrt(HARD_AI_IMAGE_BYTES / bestBlob.size) * 0.9);
    const smallerCanvas = document.createElement("canvas");
    smallerCanvas.width = Math.max(1, Math.round(width * aggressiveScale));
    smallerCanvas.height = Math.max(1, Math.round(height * aggressiveScale));
    const smallerCtx = smallerCanvas.getContext("2d");
    if (!smallerCtx) throw new Error("Could not prepare image for upload");
    smallerCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
    bestBlob = await canvasToBlob(smallerCanvas, "image/webp", 0.62);
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
  className,
}: {
  onFile: (img: UploadedImage) => void;
  onError: (msg: string) => void;
  className?: string;
}) {
  const { t } = useT();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const localizeError = useCallback(
    (message: string) => {
      const key = ERROR_MESSAGE_KEYS[message];
      return key ? t(key) : message;
    },
    [t],
  );

  const handle = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!ALLOWED.includes(file.type)) {
        onError(t("upload.error.unsupportedFormat"));
        return;
      }
      if (file.size === 0) {
        onError(t("upload.error.emptyFile"));
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        onError(t("upload.error.fileTooLarge", { maxMb: MAX_UPLOAD_MB }));
        return;
      }
      try {
        onFile(await optimizeUpload(file));
      } catch (e) {
        onError(localizeError((e as Error).message));
      }
    },
    [localizeError, onError, onFile, t],
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
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-workspace-border bg-workspace-surface px-4 py-10 text-center transition-colors hover:border-info/50 sm:px-6 sm:py-12",
        dragging && "border-info bg-info/5",
        className,
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-info/10 text-info">
        <Upload className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-workspace-foreground">{t("upload.dropTitle")}</p>
        <p className="text-xs text-workspace-muted">
          {t("upload.dropHint", { maxMb: MAX_UPLOAD_MB })}
        </p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex items-center rounded-md border border-workspace-border bg-workspace-surface px-3 py-1.5 text-xs font-medium text-workspace-foreground hover:bg-workspace-tabs"
        data-testid="upload-choose-file"
      >
        {t("upload.chooseFile")}
      </button>
      <input
        id="upload-image-file"
        name="image"
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        aria-label={t("upload.inputAria")}
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
