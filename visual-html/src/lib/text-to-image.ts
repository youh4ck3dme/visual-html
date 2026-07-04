import { loadImage, optimizeUpload } from "@/lib/image-upload";
import type { UploadedImage } from "@/lib/image-upload";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const MAX_CHARS = 2000;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export async function descriptionToUploadedImage(description: string): Promise<UploadedImage> {
  const text = description.trim().slice(0, MAX_CHARS);
  if (!text) throw new Error("Description is empty");

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare description image");

  ctx.fillStyle = "#f4f4f5";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = "#d4d4d8";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 48);

  ctx.fillStyle = "#18181b";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.fillText("UI description", 48, 72);

  ctx.fillStyle = "#3f3f46";
  ctx.font = "20px system-ui, sans-serif";
  const lines = wrapLines(ctx, text, CANVAS_WIDTH - 96);
  const maxLines = Math.floor((CANVAS_HEIGHT - 140) / 30);
  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, 48, 120 + index * 30);
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error("Could not render description"));
    }, "image/png");
  });

  const file = new File([blob], "ui-description.png", { type: "image/png" });
  const optimized = await optimizeUpload(file);
  const img = await loadImage(optimized.dataUrl);
  return { ...optimized, width: img.naturalWidth, height: img.naturalHeight };
}
