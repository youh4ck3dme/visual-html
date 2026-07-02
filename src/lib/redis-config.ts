export interface UpstashRestConfig {
  url: string;
  token: string;
  source: "upstash" | "kv" | "redis_url";
}

function isUsable(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 4 && trimmed !== '""';
}

function fromRestPair(url: string | undefined, token: string | undefined, source: UpstashRestConfig["source"]) {
  if (!isUsable(url) || !isUsable(token)) return null;
  return { url: url.trim(), token: token.trim(), source };
}

function fromRedisUrl(redisUrl: string | undefined): UpstashRestConfig | null {
  if (!isUsable(redisUrl)) return null;
  const raw = redisUrl.trim();
  if (!raw.startsWith("redis://") && !raw.startsWith("rediss://")) return null;

  try {
    const parsed = new URL(raw);
    const token = decodeURIComponent(parsed.password || "");
    const host = parsed.hostname;
    if (!host || !token) return null;
    return { url: `https://${host}`, token, source: "redis_url" };
  } catch {
    return null;
  }
}

/**
 * Resolve Upstash REST credentials from env.
 * Priority: UPSTASH_* → KV_REST_API_* → REDIS_URL / KV_URL (Vercel integration).
 */
export function resolveUpstashRestConfig(env: NodeJS.ProcessEnv = process.env): UpstashRestConfig | null {
  return (
    fromRestPair(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN, "upstash") ??
    fromRestPair(env.KV_REST_API_URL, env.KV_REST_API_TOKEN, "kv") ??
    fromRedisUrl(env.REDIS_URL) ??
    fromRedisUrl(env.KV_URL)
  );
}