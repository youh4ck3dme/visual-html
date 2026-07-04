import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const appDir = join(root, "visual-html");
const outputSrc = join(appDir, ".vercel", "output");
const outputDest = join(root, ".vercel", "output");

const build = spawnSync("bun", ["run", "build"], {
  cwd: appDir,
  env: { ...process.env, NITRO_PRESET: "vercel" },
  stdio: "inherit",
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

rmSync(outputDest, { recursive: true, force: true });
mkdirSync(join(root, ".vercel"), { recursive: true });
cpSync(outputSrc, outputDest, { recursive: true });