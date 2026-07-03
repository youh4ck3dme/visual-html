export function getPngToHtmlUrl(): string {
  const fromEnv = import.meta.env.VITE_PNGTOHTML_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:8080";
  return "https://youh4ck3dme-visual-html.vercel.app";
}