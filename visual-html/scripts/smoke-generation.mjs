#!/usr/bin/env node
/**
 * End-to-end smoke test for OCR + HTML synthesis pipeline.
 *
 * Usage:
 *   node scripts/smoke-generation.mjs
 *   SMOKE_BASE_URL=http://127.0.0.1:3000 node scripts/smoke-generation.mjs
 *   node --env-file=.env.local scripts/smoke-generation.mjs --check-env
 *
 * Requires a prior `NITRO_PRESET=vercel bun run build` to resolve server fn IDs
 * from .vercel/output, unless SERVER_FN_OCR_ID / SERVER_FN_GENERATE_ID are set.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { toJSONAsync, fromCrossJSON } from "seroval";
import { defaultSerovalPlugins } from "@tanstack/router-core";

const plugins = defaultSerovalPlugins;
const BASE_URL = process.env.SMOKE_BASE_URL ?? "https://visual-html.vercel.app";
const CHECK_ENV_ONLY = process.argv.includes("--check-env");

// 1x1 PNG — tiny payload, fast upload; OCR may hallucinate text but synthesis should still return JSON.
const TEST_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const DEFAULT_OPTIONS = {
  outputMode: "static",
  stylingMode: "vanilla-css",
  responsiveness: "adaptive",
  accessibilityLevel: "strict",
  additionalInstructions: "Smoke test: return minimal valid HTML for a simple card.",
};

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

function mask(value) {
  if (!value) return "MISSING";
  if (value.length <= 8) return `set (${value.length} chars)`;
  return `${value.slice(0, 4)}...${value.slice(-4)} (${value.length} chars)`;
}

function checkEnv() {
  loadDotEnv();
  const keys = [
    "MISTRAL_API_KEY",
    "MISTRAL_API_KEY_FALLBACK",
    "MISTRAL_API_KEYS",
    "MISTRAL_OCR_API_KEY",
    "MISTRAL_OCR_API_KEY_FALLBACK",
    "MISTRAL_OCR_API_KEYS",
    "MISTRAL_CHAT_API_KEY",
    "MISTRAL_CHAT_API_KEY_FALLBACK",
    "MISTRAL_CHAT_API_KEYS",
    "BLOB_READ_WRITE_TOKEN",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
  ];
  console.log("=== Environment check (local .env.local) ===");
  for (const key of keys) console.log(`${key}: ${mask(process.env[key])}`);
  const hasMistralKey = [
    process.env.MISTRAL_API_KEY,
    process.env.MISTRAL_API_KEY_FALLBACK,
    process.env.MISTRAL_API_KEYS,
    process.env.MISTRAL_OCR_API_KEY,
    process.env.MISTRAL_OCR_API_KEY_FALLBACK,
    process.env.MISTRAL_OCR_API_KEYS,
    process.env.MISTRAL_CHAT_API_KEY,
    process.env.MISTRAL_CHAT_API_KEY_FALLBACK,
    process.env.MISTRAL_CHAT_API_KEYS,
  ].some((value) => Boolean(value?.trim()));

  if (!hasMistralKey) {
    console.error(
      "\nFAIL: no Mistral API key configured — set MISTRAL_API_KEY or MISTRAL_API_KEY_FALLBACK.",
    );
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("\nFAIL: BLOB_READ_WRITE_TOKEN is missing — OCR upload will fail.");
    process.exit(1);
  }
  console.log("\nOK: required local env vars present");
}

function resolveServerFnIds() {
  if (process.env.SERVER_FN_OCR_ID && process.env.SERVER_FN_GENERATE_ID) {
    return {
      ocr: process.env.SERVER_FN_OCR_ID,
      generate: process.env.SERVER_FN_GENERATE_ID,
    };
  }

  const ssrDir = ".vercel/output/functions/__server.func/_ssr";
  if (!existsSync(ssrDir)) {
    throw new Error(
      "Server fn IDs not found. Run `NITRO_PRESET=vercel bun run build` or set SERVER_FN_OCR_ID / SERVER_FN_GENERATE_ID.",
    );
  }

  const file = readdirSync(ssrDir).find((name) => name.startsWith("generate.functions-"));
  if (!file) throw new Error(`No generate.functions bundle in ${ssrDir}`);

  const source = readFileSync(join(ssrDir, file), "utf8");
  const pick = (name) => {
    const match = source.match(
      new RegExp(`id:\\s*"([a-f0-9]{64})"[\\s\\S]{0,120}?name:\\s*"${name}"`),
    );
    if (!match) throw new Error(`Could not resolve server fn id for ${name}`);
    return match[1];
  };

  return { ocr: pick("runOcr"), generate: pick("generateHtml") };
}

async function callServerFn(id, data) {
  const body = JSON.stringify(await toJSONAsync({ data }, { plugins }));
  const started = Date.now();
  const res = await fetch(`${BASE_URL}/_serverFn/${id}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tsr-serverFn": "true",
      accept: "application/json",
    },
    body,
  });
  const elapsedMs = Date.now() - started;
  const text = await res.text();

  let parsed;
  try {
    parsed = fromCrossJSON(JSON.parse(text), { plugins });
  } catch (error) {
    return {
      httpStatus: res.status,
      elapsedMs,
      parseError: error.message,
      raw: text.slice(0, 500),
    };
  }

  return { httpStatus: res.status, elapsedMs, parsed };
}

function printServerError(label, payload) {
  const result = payload?.parsed?.result;
  if (!result || result.ok) return false;
  const err = result.error ?? {};
  console.error(`\n${label} FAILED`);
  console.error(`  code: ${err.code ?? "unknown"}`);
  console.error(`  phase: ${err.phase ?? "unknown"}`);
  console.error(`  message: ${err.message ?? "no message"}`);
  if (err.diagnostic) {
    console.error(`  title: ${err.diagnostic.title}`);
    console.error(`  likelyCause: ${err.diagnostic.likelyCause}`);
    console.error(`  suggestedFix: ${err.diagnostic.suggestedFix}`);
  }
  return true;
}

async function main() {
  if (CHECK_ENV_ONLY) {
    checkEnv();
    return;
  }

  loadDotEnv();
  const { ocr, generate } = resolveServerFnIds();

  console.log("=== PNGtoHTMLapp generation smoke test ===");
  console.log(`base: ${BASE_URL}`);
  console.log(`ocr fn: ${ocr.slice(0, 12)}…`);
  console.log(`generate fn: ${generate.slice(0, 12)}…`);

  const hasLocalMistralKey = [
    process.env.MISTRAL_API_KEY,
    process.env.MISTRAL_API_KEY_FALLBACK,
    process.env.MISTRAL_OCR_API_KEY,
    process.env.MISTRAL_CHAT_API_KEY,
    process.env.MISTRAL_API_KEYS,
  ].some((value) => Boolean(value?.trim()));

  if (!hasLocalMistralKey) {
    console.warn(
      "\nWARN: no local Mistral key — remote BASE_URL may still work if Vercel env is configured.",
    );
  }

  console.log("\n1) runOcr …");
  const ocrRes = await callServerFn(ocr, {
    imageBase64: TEST_PNG_BASE64,
    mimeType: "image/png",
  });
  console.log(`   http ${ocrRes.httpStatus} in ${ocrRes.elapsedMs}ms`);
  if (ocrRes.parseError) {
    console.error("   seroval parse error:", ocrRes.parseError, ocrRes.raw);
    process.exit(1);
  }
  if (printServerError("OCR", ocrRes)) process.exit(1);

  const ocrMarkdown = ocrRes.parsed.result.ocrMarkdown;
  console.log(`   ocrMarkdown: ${ocrMarkdown.length} chars`);

  console.log("\n2) generateHtml …");
  const genRes = await callServerFn(generate, {
    imageBase64: TEST_PNG_BASE64,
    mimeType: "image/png",
    ocrMarkdown,
    options: DEFAULT_OPTIONS,
  });
  console.log(`   http ${genRes.httpStatus} in ${genRes.elapsedMs}ms`);
  if (genRes.parseError) {
    console.error("   seroval parse error:", genRes.parseError, genRes.raw);
    process.exit(1);
  }
  if (printServerError("generateHtml", genRes)) process.exit(1);

  const data = genRes.parsed.result.data;
  const htmlLen = data?.html?.length ?? 0;
  const cssLen = data?.css?.length ?? 0;
  console.log(`   html: ${htmlLen} chars, css: ${cssLen} chars`);
  if (htmlLen < 20) {
    console.error("\nFAIL: synthesis returned empty or trivial HTML");
    process.exit(1);
  }

  console.log(`   preview: ${data.html.slice(0, 120).replace(/\s+/g, " ")}…`);
  console.log("\nOK: OCR + generateHtml pipeline healthy");
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
