import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Per-IP rate limiting backed by Upstash Redis so limits are shared across all
// serverless instances (unlike an in-memory counter, which resets on cold start
// and is not shared between lambdas).
//
// Two independent limiters are enforced:
//   - Burst:  BURST_LIMIT requests per BURST_WINDOW (short-term abuse guard).
//   - Daily:  DAILY_LIMIT requests per 24h (cost cap against sustained abuse).

const BURST_LIMIT = Number.parseInt(process.env.RATE_LIMIT_BURST ?? "5", 10);
const BURST_WINDOW = "60 s" as const;
const DAILY_LIMIT = Number.parseInt(process.env.RATE_LIMIT_DAILY ?? "100", 10);

type Limiters = {
  burst: Ratelimit;
  daily: Ratelimit;
};

let cached: Limiters | null | undefined;

function getLimiters(): Limiters | null {
  if (cached !== undefined) return cached;

  // Vercel Upstash integration exposes KV_*; manual setup uses UPSTASH_*.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    // Fail-open when unconfigured (e.g. local dev) so the app stays usable, but
    // make the missing protection loud so it is not silently shipped to prod.
    console.warn(
      "Rate limiting disabled: UPSTASH_REDIS_REST_* or KV_REST_API_* are not set.",
    );
    cached = null;
    return cached;
  }

  const redis = new Redis({ url, token });
  cached = {
    burst: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(BURST_LIMIT, BURST_WINDOW),
      prefix: "rl:burst",
      analytics: false,
    }),
    daily: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
      prefix: "rl:daily",
      analytics: false,
    }),
  };
  return cached;
}

export interface RateLimitResult {
  success: boolean;
  scope?: "burst" | "daily";
}

/**
 * Enforce per-IP burst and daily limits for a given action.
 *
 * Returns `{ success: true }` when the request is allowed (including when rate
 * limiting is not configured). On failure, `scope` indicates which limit tripped.
 */
export async function checkRateLimit(ip: string, action: string): Promise<RateLimitResult> {
  const limiters = getLimiters();
  if (!limiters) return { success: true };

  const identifier = `${action}:${ip}`;

  const daily = await limiters.daily.limit(identifier);
  if (!daily.success) return { success: false, scope: "daily" };

  const burst = await limiters.burst.limit(identifier);
  if (!burst.success) return { success: false, scope: "burst" };

  return { success: true };
}
