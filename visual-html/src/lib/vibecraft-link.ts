/** VibeCraft app URL — local dev or production. */
export function getVibecraftUrl(): string {
  const fromEnv = import.meta.env.VITE_VIBECRAFT_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:5173";
  return "https://vibecraft.rubberduck.sk";
}