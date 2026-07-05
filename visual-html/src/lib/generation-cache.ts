function fallbackHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return `fb-${(h >>> 0).toString(16)}`;
}

export async function sha256Key(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return fallbackHash(input);
}

const CACHE_PREFIX = "pngto-gen-cache:";
const OCR_CACHE_PREFIX = "pngto-ocr-cache:";

export function getCachedGeneration(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(CACHE_PREFIX + key);
  } catch {
    return null;
  }
}

export function getCachedOcrMarkdown(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(OCR_CACHE_PREFIX + key);
  } catch {
    return null;
  }
}

export function setCachedGeneration(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    /* quota */
  }
}

export function setCachedOcrMarkdown(key: string, markdown: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(OCR_CACHE_PREFIX + key, markdown);
  } catch {
    /* quota */
  }
}

export async function cacheKeyForOcr(imageBase64: string, mimeType: string): Promise<string> {
  return sha256Key(`ocr::${mimeType}::${imageBase64.length}::${imageBase64.slice(0, 8192)}`);
}

export function getProjectOcrMarkdown(projectId: string): string | null {
  return getCachedOcrMarkdown(`project:${projectId}`);
}

export function setProjectOcrMarkdown(projectId: string, markdown: string): void {
  setCachedOcrMarkdown(`project:${projectId}`, markdown);
}

export async function cacheKeyForPrompt(prompt: string, model: string): Promise<string> {
  return sha256Key(`${model}::${prompt.trim()}`);
}
