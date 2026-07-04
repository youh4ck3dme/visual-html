import {
  HARD_AI_IMAGE_BYTES,
  IDEAL_AI_IMAGE_BYTES,
  MAX_AI_IMAGE_DIMENSION,
} from "@/lib/image-budget";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/validation/generation";

export interface UploadedImage {
  file: File;
  dataUrl: string;
  base64: string;
  mimeType: (typeof ALLOWED_MIME)[number];
  width: number;
  height: number;
}

const TARGET_UPLOAD_BYTES = IDEAL_AI_IMAGE_BYTES;
const WEBP_QUALITIES = [0.88, 0.78, 0.68, 0.58, 0.48] as const;

export async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not read file"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

export async function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not process image"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
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

export async function toUploadedImage(file: File, dataUrl?: string): Promise<UploadedImage> {
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

export async function optimizeUpload(file: File): Promise<UploadedImage> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds size limit");
  }

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

export function uploadedImageFromBase64(
  base64: string,
  mimeType: UploadedImage["mimeType"],
  fileName: string,
  width: number,
  height: number,
): UploadedImage {
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const blob = base64ToBlob(base64, mimeType);
  const file = new File([blob], fileName, { type: mimeType });
  return { file, dataUrl, base64, mimeType, width, height };
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}