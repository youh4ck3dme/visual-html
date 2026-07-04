#!/usr/bin/env node
/**
 * Quick smoke test: hits Upstash-backed rate limiter (uses KV_* or UPSTASH_* from env).
 * Usage: node --env-file=.env.local scripts/test-rate-limit.mjs
 */
import { readFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

// Bun/node --env-file may not exist on older node; load .env.local manually as fallback.
try {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
} catch {
  /* optional */
}

const { checkRateLimit } = await import("../src/lib/rate-limit.server.ts");

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

if (!redisUrl || !redisToken) {
  console.error("FAIL: UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN are not set");
  process.exit(1);
}

try {
  const redis = new Redis({ url: redisUrl, token: redisToken });
  await redis.incr(`rl:probe:${Date.now()}`);
} catch (error) {
  const message = error?.message ?? String(error);
  if (/NOPERM|no permissions/i.test(message)) {
    console.error(
      "FAIL: Upstash token is read-only. Use the read-write REST token from the database Connect tab, not KV_REST_API_READ_ONLY_TOKEN.",
    );
    process.exit(1);
  }
  throw error;
}

const ip = `test-${Date.now()}`;
const burst = Number.parseInt(process.env.RATE_LIMIT_BURST ?? "5", 10);

let limited = false;
for (let i = 1; i <= burst + 2; i++) {
  const res = await checkRateLimit(ip, "smoke");
  console.log(`request ${i}:`, res);
  if (!res.success) {
    limited = true;
    console.log(`rate limit tripped on request ${i} (scope: ${res.scope})`);
    break;
  }
}

if (!limited) {
  console.error("FAIL: expected rate limit after burst window");
  process.exit(1);
}

console.log("OK: Upstash rate limiting is active");
