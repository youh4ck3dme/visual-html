import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const target = join(process.cwd(), "node_modules", "nf3", "dist", "_chunks", "trace.mjs");

if (!existsSync(target)) {
  console.log("[patch-nf3] skipped: nf3 trace file not found");
  process.exit(0);
}

const source = readFileSync(target, "utf8");
const from = 'import { nodeFileTrace } from "@vercel/nft";';
const to = ['import nftPkg from "@vercel/nft";', "const { nodeFileTrace } = nftPkg;"].join("\n");

if (source.includes(to)) {
  console.log("[patch-nf3] already patched");
  process.exit(0);
}

if (!source.includes(from)) {
  console.warn("[patch-nf3] skipped: expected import line not found");
  process.exit(0);
}

writeFileSync(target, source.replace(from, to), "utf8");
console.log("[patch-nf3] patched nf3 trace import for @vercel/nft interop");
