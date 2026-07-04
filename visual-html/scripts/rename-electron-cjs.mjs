import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("dist-electron");

for (const file of ["main.js", "preload.js"]) {
  const from = path.join(outDir, file);
  const to = path.join(outDir, file.replace(/\.js$/, ".cjs"));
  if (!fs.existsSync(from)) {
    throw new Error(`Missing Electron build artifact: ${from}`);
  }
  fs.renameSync(from, to);
}

console.log("Renamed Electron main/preload to .cjs");
