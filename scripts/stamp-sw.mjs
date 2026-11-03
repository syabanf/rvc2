// postbuild: give the exported service worker a cache name unique to this build,
// so returning visitors drop the old cache on every deploy (no manual VERSION bump).
import { readFileSync, writeFileSync } from "node:fs";

const buildId = readFileSync(".next/BUILD_ID", "utf8").trim();
const file = "out/sw.js";
const src = readFileSync(file, "utf8");
const next = src.replace(/const VERSION = '[^']*';/, `const VERSION = 'rvc-${buildId}';`);
if (next === src) throw new Error("stamp-sw: VERSION line not found in out/sw.js");
writeFileSync(file, next);
console.log(`stamp-sw: VERSION = rvc-${buildId}`);
