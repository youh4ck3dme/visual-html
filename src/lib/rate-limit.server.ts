import { Redis } from "@upstash/redis";

// Per-IP rate limiting backed by Upstash Redis so limits are shared across all
// serverless instances (unlike an in-memory counter, which resets on cold start
// and is not shared between lambdas).
//
// Two independent limiters are enforced:
//   - Burst:  BURST_LIMIT requests per 60s fixed window (short-term abuse guard).
//   - Daily:  DAILY_LIMIT requests per 24h (cost cap against sustained abuse).
//
// This intentionally avoids @upstash/ratelimit because that package uses Lua
// script commands (eval/evalsha). Some Vercel KV / restricted Upstash tokens do
// not allow those commands, but they do allow INCR + EXPIRE.

const BURST_LIMIT = Number.parseInt(process.env.RATE_LIMIT_BURST ?? "5", 10);
const BURST_WINDOW_SECONDS = 60;
const DAILY_LIMIT = Number.parseInt(process.env.RATE_LIMIT_DAILY ?? "100", 10);

let cached: Redis | null | undefined;

function getRedis(): Redis | null {
  if (cached !== undefined) return cached;

  // Vercel Upstash integration exposes KV_*; manual setup uses UPSTASH_*.
  // Never use read-only tokens — rate limiting needs INCR/EXPIRE.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    // Fail-open when unconfigured (e.g. local dev) so the app stays usable, but
    // make the missing protection loud so it is not silently shipped to prod.
    console.warn("Rate limiting disabled: UPSTASH_REDIS_REST_* or KV_REST_API_* are not set.");
    cached = null;
    return cached;
  }

  cached = new Redis({ url, token });
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
  const redis = getRedis();
  if (!redis) return { success: true };

  const identifier = sanitizeIdentifier(`${action}:${ip}`);

  try {
    const dailyKey = `rl:daily:${identifier}:${utcDayKey()}`;
    const dailyCount = await incrementWindow(redis, dailyKey, secondsUntilTomorrowUtc());
    if (dailyCount > DAILY_LIMIT) return { success: false, scope: "daily" };

    const burstBucket = Math.floor(Date.now() / (BURST_WINDOW_SECONDS * 1000));
    const burstKey = `rl:burst:${identifier}:${burstBucket}`;
    const burstCount = await incrementWindow(redis, burstKey, BURST_WINDOW_SECONDS + 5);
    if (burstCount > BURST_LIMIT) return { success: false, scope: "burst" };
  } catch (err) {
    console.warn("Rate limiting failed open", {
      action,
      name: (err as { name?: string })?.name,
      message: (err as { message?: string })?.message,
    });
    return { success: true };
  }

  return { success: true };
}

async function incrementWindow(redis: Redis, key: string, ttlSeconds: number): Promise<number> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, ttlSeconds);
  }
  return count;
}

function sanitizeIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9:._-]/g, "_").slice(0, 200);
}

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function secondsUntilTomorrowUtc(date = new Date()): number {
  const tomorrow = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
  return Math.max(60, Math.ceil((tomorrow - date.getTime()) / 1000));
}
