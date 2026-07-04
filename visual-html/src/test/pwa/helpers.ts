import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function resolvePublicDir(): string {
  const candidates = [
    join(process.cwd(), "public"),
    join(process.cwd(), "visual-html/public"),
    join(dirname(fileURLToPath(import.meta.url)), "../../../public"),
  ];

  for (const dir of candidates) {
    if (existsSync(join(dir, "favicon.ico"))) {
      return dir;
    }
  }

  return join(process.cwd(), "public");
}

export function publicPath(file: string): string {
  return join(resolvePublicDir(), file);
}

export function readPublicFile(file: string): Buffer {
  return readFileSync(publicPath(file));
}

export function readPublicText(file: string): string {
  return readFileSync(publicPath(file), "utf-8");
}

export function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Not a PNG file");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

export function isSquarePng(file: string): boolean {
  const { width, height } = readPngDimensions(readPublicFile(file));
  return width === height;
}
