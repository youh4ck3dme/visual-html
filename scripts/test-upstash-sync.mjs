#!/usr/bin/env node
/**
 * Upstash connection + env sync test (local REST + optional production rate-limit probe).
 *
 * Usage:
 *   bun --env-file=.env.local scripts/test-upstash-sync.mjs
 *   SKIP_PROD=1 bun --env-file=.env.local scripts/test-upstash-sync.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Redis } from "@upstash/redis";
import { toJSONAsync, fromCrossJSON } from "seroval";
import { defaultSerovalPlugins } from "@tanstack/router-core";

const plugins = defaultSerovalPlugins;
const BASE_URL = process.env.SMOKE_BASE_URL ?? "https://visual-html.vercel.app";
const SKIP_PROD = process.env.SKIP_PROD === "1";
const TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function loadDotEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    /* optional */
  }
}

function hostFromUrl(url) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return null;
  }
}

function hostFromRedisUrl(redisUrl) {
  if (!redisUrl) return null;
  try {
    return new URL(redisUrl).hostname;
  } catch {
    return null;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function testEnvAlignment() {
  const upstashHost = hostFromUrl(process.env.UPSTASH_REDIS_REST_URL);
  const kvHost = hostFromUrl(process.env.KV_REST_API_URL);
  const redisHost = hostFromRedisUrl(process.env.REDIS_URL);
  const kvUrlHost = hostFromUrl(process.env.KV_URL);

  console.log("=== 1) Env alignment ===");
  console.log(`UPSTASH host: ${upstashHost ?? "MISSING"}`);
  console.log(`KV_REST host: ${kvHost ?? "MISSING"}`);
  console.log(`REDIS_URL host: ${redisHost ?? "MISSING"}`);
  console.log(`KV_URL host: ${kvUrlHost ?? "MISSING"}`);

  assert(upstashHost, "UPSTASH_REDIS_REST_URL is missing");
  assert(process.env.UPSTASH_REDIS_REST_TOKEN?.length > 10, "UPSTASH_REDIS_REST_TOKEN is missing");
  assert(kvHost === upstashHost, `KV_REST_API_URL host mismatch (${kvHost} vs ${upstashHost})`);
  assert(redisHost === upstashHost.replace(/^https?:\/\//, ""), `REDIS_URL host mismatch`);
  console.log("OK: all env vars point to the same Upstash database");
}

async function testRestRoundtrip() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const key = `sync:visual-html:${Date.now()}`;
  const marker = `ok-${Date.now()}`;

  console.log("\n=== 2) REST write/read (Redis compatibility: SET, GET, INCR, EXPIRE, DEL) ===");

  await redis.set(key, marker, { ex: 120 });
  const got = await redis.get(key);
  assert(got === marker, `SET/GET failed (expected ${marker}, got ${got})`);
  console.log(`SET/GET: ${key} = ${got}`);

  const counterKey = `${key}:counter`;
  const n1 = await redis.incr(counterKey);
  const n2 = await redis.incr(counterKey);
  await redis.expire(counterKey, 120);
  assert(n1 === 1 && n2 === 2, `INCR failed (${n1}, ${n2})`);
  console.log(`INCR/EXPIRE: ${counterKey} → ${n2}`);

  await redis.del(key, counterKey);
  const afterDel = await redis.get(key);
  assert(afterDel == null, "DEL failed — key still exists");
  console.log("DEL: keys removed");
  console.log("OK: REST roundtrip healthy");
}

async function testConfigResolver() {
  const { resolveUpstashRestConfig } = await import("../src/lib/redis-config.ts");

  console.log("\n=== 3) resolveUpstashRestConfig ===");
  const config = resolveUpstashRestConfig();
  assert(config?.source === "upstash", `expected source upstash, got ${config?.source}`);
  assert(config.url === process.env.UPSTASH_REDIS_REST_URL, "resolver URL mismatch");
  console.log(`source: ${config.source}, url: ${config.url}`);
  console.log("OK: app resolver picks UPSTASH_* credentials");
}

async function testLocalRateLimit() {
  console.log("\n=== 4) Local rate limiter (shared Redis state) ===");
  const { checkRateLimit } = await import("../src/lib/rate-limit.server.ts");
  const ip = `sync-${Date.now()}`;
  const burst = Number.parseInt(process.env.RATE_LIMIT_BURST ?? "5", 10);
  let tripped = false;

  for (let i = 1; i <= burst + 1; i++) {
    const res = await checkRateLimit(ip, "sync-test");
    if (!res.success) {
      tripped = true;
      assert(i === burst + 1, `rate limit tripped early on request ${i}`);
      console.log(`request ${i}: limited (scope: ${res.scope})`);
      break;
    }
    console.log(`request ${i}: allowed`);
  }

  assert(tripped, "rate limiter did not trip after burst window");
  console.log("OK: local rate limiter uses Upstash");
}

function resolveOcrFnId() {
  if (process.env.SERVER_FN_OCR_ID) return process.env.SERVER_FN_OCR_ID;

  const ssrDir = ".vercel/output/functions/__server.func/_ssr";
  if (!existsSync(ssrDir)) {
    throw new Error(
      "Set SERVER_FN_OCR_ID or run `NITRO_PRESET=vercel bun run build` to resolve production fn id.",
    );
  }

  const file = readdirSync(ssrDir).find((name) => name.startsWith("generate.functions-"));
  if (!file) throw new Error(`No generate.functions bundle in ${ssrDir}`);

  const source = readFileSync(join(ssrDir, file), "utf8");
  const match = source.match(/id:\s*"([a-f0-9]{64})"[\s\S]{0,120}?name:\s*"runOcr"/);
  if (!match) throw new Error("Could not resolve server fn id for runOcr");
  return match[1];
}

async function callOcr(id) {
  const body = JSON.stringify(
    await toJSONAsync(
      { data: { imageBase64: TEST_PNG_BASE64, mimeType: "image/png" } },
      { plugins },
    ),
  );
  const res = await fetch(`${BASE_URL}/_serverFn/${id}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tsr-serverFn": "true",
      accept: "application/json",
    },
    body,
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = fromCrossJSON(JSON.parse(text), { plugins });
  } catch {
    return { httpStatus: res.status, rateLimited: false, parseError: true, raw: text.slice(0, 200) };
  }
  const result = parsed?.result;
  const rateLimited = result?.ok === false && result?.error?.code === "RATE_LIMITED";
  return { httpStatus: res.status, rateLimited, result };
}

async function testProductionSync() {
  if (SKIP_PROD) {
    console.log("\n=== 5) Production sync — SKIPPED (SKIP_PROD=1) ===");
    return;
  }

  console.log(`\n=== 5) Production sync (${BASE_URL}) ===`);
  const ocrId = resolveOcrFnId();
  const burst = Number.parseInt(process.env.RATE_LIMIT_BURST ?? "5", 10);
  console.log(`runOcr fn: ${ocrId.slice(0, 12)}…`);

  let allowed = 0;
  let limited = 0;

  for (let i = 1; i <= burst + 2; i++) {
    const res = await callOcr(ocrId);
    if (res.parseError) {
      console.log(`request ${i}: http ${res.httpStatus} (parse error — deployment may have changed fn id)`);
      continue;
    }
    if (res.rateLimited) {
      limited++;
      console.log(`request ${i}: RATE_LIMITED`);
    } else {
      allowed++;
      console.log(`request ${i}: allowed (http ${res.httpStatus})`);
    }
  }

  assert(limited > 0, "production never returned RATE_LIMITED — Upstash may be disconnected on Vercel");
  console.log(`OK: production rate limiting active (${allowed} allowed, ${limited} limited)`);
}

async function main() {
  loadDotEnv();
  console.log("=== Upstash sync test ===\n");

  await testEnvAlignment();
  await testRestRoundtrip();
  await testConfigResolver();
  await testLocalRateLimit();
  await testProductionSync();

  console.log("\n=== SYNC OK ===");
  console.log("Local .env.local ↔ Upstash awake-bluejay ↔ app resolver ↔ rate limiter aligned.");
}

main().catch((err) => {
  console.error("\nSYNC FAIL:", err.message ?? err);
  process.exit(1);
});