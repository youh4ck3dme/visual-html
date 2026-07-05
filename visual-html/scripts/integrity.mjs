#!/usr/bin/env node
/**
 * Full app integrity suite.
 * Usage:
 *   node scripts/integrity.mjs [--skip-smoke] [--skip-production] [--skip-rate-limit]
 *   node scripts/integrity.mjs --iphone-17-air
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const iphone17Air = args.has("--iphone-17-air");
const skipRateLimit = args.has("--skip-rate-limit") || iphone17Air;
const skipSmoke = args.has("--skip-smoke") || iphone17Air;
const skipProduction = args.has("--skip-production") || iphone17Air;
const root = process.cwd();

const results = [];

function run(name, command, cmdArgs = [], options = {}) {
  const started = Date.now();
  const proc = spawnSync(command, cmdArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  const ok = proc.status === 0;
  results.push({
    name,
    ok,
    ms: Date.now() - started,
    stdout: (proc.stdout || "").trim(),
    stderr: (proc.stderr || "").trim(),
  });
  return ok;
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

if (iphone17Air) {
  section("iPhone 17 Air integrity lane");
}

section("TypeScript");
run("tsc --noEmit", "npx", ["tsc", "--noEmit"]);

section(iphone17Air ? "iPhone 17 Air tests" : "Unit tests");
if (iphone17Air) {
  run("vitest iphone", "npx", [
    "vitest",
    "run",
    "src/test/pwa/",
    "src/test/mobile/",
    "src/test/buttons/builder-mobile.buttons.test.tsx",
  ]);
} else {
  run("vitest", "npx", ["vitest", "run"]);
}

section("ESLint (src + scripts)");
run("eslint", "npx", ["eslint", "src", "scripts", "--max-warnings", "0"]);

if (!iphone17Air) {
  section("Production build");
  run("build", "npm", ["run", "build"], {
    env: { ...process.env, NITRO_PRESET: "vercel" },
  });

  section("Build artifacts");
  const staticDir = ".vercel/output/static";
  const requiredStatic = [
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "site.webmanifest",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "icon.png",
    "vibecraft-circuit.svg",
  ];
  const artifactOk = existsSync(staticDir);
  let artifactDetail = artifactOk ? "static dir present" : "missing .vercel/output/static";
  if (artifactOk) {
    const missing = requiredStatic.filter((file) => !existsSync(join(staticDir, file)));
    if (missing.length) {
      results.push({
        name: "build artifacts",
        ok: false,
        ms: 0,
        stdout: "",
        stderr: `Missing: ${missing.join(", ")}`,
      });
    } else {
      const ssrDir = ".vercel/output/functions/__server.func/_ssr";
      const genFile = existsSync(ssrDir)
        ? readdirSync(ssrDir).find((name) => name.startsWith("generate.functions-"))
        : null;
      const builderFile = existsSync(ssrDir)
        ? readdirSync(ssrDir).find((name) => name.startsWith("builder.functions-"))
        : null;
      const hasGenerateFn = Boolean(
        genFile && readFileSync(join(ssrDir, genFile), "utf8").includes("runOcr"),
      );
      const hasBuilderFn = Boolean(
        builderFile && readFileSync(join(ssrDir, builderFile), "utf8").includes("builderChat"),
      );
      const hasServerFns = hasGenerateFn && hasBuilderFn;
      results.push({
        name: "build artifacts",
        ok: hasServerFns,
        ms: 0,
        stdout: `favicon/manifest OK; generate ${hasGenerateFn ? "OK" : "MISSING"}; builder ${hasBuilderFn ? "OK" : "MISSING"}`,
        stderr: hasServerFns
          ? ""
          : [
              !hasGenerateFn && "generate.functions bundle missing runOcr",
              !hasBuilderFn && "builder.functions bundle missing builderChat",
            ]
              .filter(Boolean)
              .join("; "),
      });
    }
  } else {
    results.push({
      name: "build artifacts",
      ok: false,
      ms: 0,
      stdout: "",
      stderr: artifactDetail,
    });
  }
}

if (!skipSmoke) {
  section("Env check");
  run("smoke --check-env", "node", ["scripts/smoke-generation.mjs", "--check-env"]);

  if (!skipRateLimit) {
    section("Rate limit (Upstash)");
    const rateOk = run("rate-limit", "bun", [
      "--env-file=.env.local",
      "scripts/test-rate-limit.mjs",
    ]);
    if (!rateOk) {
      const last = results[results.length - 1];
      if (/NOPERM|no permissions/i.test(`${last.stdout}\n${last.stderr}`)) {
        last.stderr +=
          "\nHint: UPSTASH_REDIS_REST_TOKEN must be read-write (not KV_REST_API_READ_ONLY_TOKEN).";
      }
    }
  }
}

if (!skipProduction) {
  section("Production HTTP");
  const base = process.env.SMOKE_BASE_URL || "https://visual-html.vercel.app";
  const paths = ["/", "/favicon.ico", "/site.webmanifest"];
  const checks = [];
  for (const path of paths) {
    const proc = spawnSync(
      "curl",
      ["-sI", "-o", "/dev/null", "-w", "%{http_code}", `${base}${path}`],
      {
        encoding: "utf8",
      },
    );
    const code = (proc.stdout || "").trim();
    checks.push({ path, code, ok: code === "200" });
  }
  const prodOk = checks.every((c) => c.ok);
  results.push({
    name: "production http",
    ok: prodOk,
    ms: 0,
    stdout: checks.map((c) => `${c.path} -> ${c.code}`).join("; "),
    stderr: prodOk ? "" : "One or more production endpoints not 200",
  });
}

if (!skipSmoke) {
  section("E2E generation smoke (production API)");
  run("smoke generation", "node", ["scripts/smoke-generation.mjs"]);
}

function walkSourceFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const filePath = join(dir, name);
    if (statSync(filePath).isDirectory()) walkSourceFiles(filePath, acc);
    else if (/\.(ts|tsx|mjs)$/.test(name)) acc.push(filePath);
  }
  return acc;
}

if (!iphone17Air) {
  section("Editor i18n grep");
  const editorDirs = ["src/components/editor", "src/pages"].map((d) => join(root, d));
  const hardcodedHits = [];
  const jsxTextRe = />\s*([A-Z][A-Za-z0-9 ,.'!?-]{4,})\s*</g;
  for (const dir of editorDirs) {
    for (const filePath of walkSourceFiles(dir)) {
      if (!filePath.endsWith(".tsx")) continue;
      const rel = filePath.slice(root.length + 1);
      const lines = readFileSync(filePath, "utf8").split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (
          line.includes("t(") ||
          line.includes("messages[") ||
          line.includes("testId") ||
          line.includes("data-testid") ||
          line.includes("import ") ||
          line.trim().startsWith("//") ||
          line.includes("className")
        ) {
          continue;
        }
        for (const match of line.matchAll(jsxTextRe)) {
          hardcodedHits.push(`${rel}:${i + 1}: "${match[1].trim()}"`);
        }
      }
    }
  }
  results.push({
    name: "editor i18n grep",
    ok: hardcodedHits.length === 0,
    ms: 0,
    stdout: hardcodedHits.length
      ? hardcodedHits.slice(0, 8).join("; ")
      : "no raw JSX text in editor/pages",
    stderr: hardcodedHits.length ? "Move user-facing strings to messages.ts" : "",
  });
}

section("BYOK log audit");
const byokPattern = /console\.(log|info|debug|warn)\([^)]*MISTRAL_API_KEY/;
const byokHits = walkSourceFiles(join(root, "src")).filter((filePath) =>
  byokPattern.test(readFileSync(filePath, "utf8")),
);
results.push({
  name: "byok log audit",
  ok: byokHits.length === 0,
  ms: 0,
  stdout: byokHits.length ? byokHits.join(", ") : "no API key logging in src/",
  stderr: byokHits.length ? "Remove API keys from console logging" : "",
});

section("Summary");
let failed = 0;
for (const result of results) {
  const status = result.ok ? "PASS" : "FAIL";
  if (!result.ok) failed += 1;
  console.log(`${status}  ${result.name} (${result.ms}ms)`);
  if (!result.ok && result.stderr) console.log(`       ${result.stderr.split("\n")[0]}`);
}

const summaryLabel = iphone17Air ? "iPhone 17 Air integrity" : "checks";
console.log(`\n${results.length - failed}/${results.length} ${summaryLabel} passed`);
process.exit(failed === 0 ? 0 : 1);
