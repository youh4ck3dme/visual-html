import { afterEach, describe, expect, it } from "vitest";

import { resolveUpstashRestConfig } from "./redis-config";

const KEYS = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "REDIS_URL",
  "KV_URL",
] as const;

function clearEnv() {
  for (const key of KEYS) delete process.env[key];
}

describe("resolveUpstashRestConfig", () => {
  afterEach(() => {
    clearEnv();
  });

  it("prefers UPSTASH_* over KV_*", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://primary.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "primary-token";
    process.env.KV_REST_API_URL = "https://secondary.upstash.io";
    process.env.KV_REST_API_TOKEN = "secondary-token";

    expect(resolveUpstashRestConfig()).toEqual({
      url: "https://primary.upstash.io",
      token: "primary-token",
      source: "upstash",
    });
  });

  it("ignores empty quoted placeholders from Vercel", () => {
    process.env.UPSTASH_REDIS_REST_URL = '""';
    process.env.UPSTASH_REDIS_REST_TOKEN = '""';
    process.env.REDIS_URL = "rediss://default:abc123@awake-bluejay-156393.upstash.io:6379";

    expect(resolveUpstashRestConfig()?.source).toBe("redis_url");
    expect(resolveUpstashRestConfig()?.url).toBe("https://awake-bluejay-156393.upstash.io");
    expect(resolveUpstashRestConfig()?.token).toBe("abc123");
  });
});
