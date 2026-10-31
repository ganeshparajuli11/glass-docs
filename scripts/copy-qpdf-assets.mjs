// Copies the qpdf WebAssembly build (@neslinesli93/qpdf-wasm: qpdf 12 compiled
// with Emscripten) into public/qpdf so the Protect PDF and Unlock PDF tools can
// load it from this origin — never from a CDN. Output is git-ignored and
// rebuilt on every build. The worker that drives it (public/qpdf-worker.js) is
// committed. Only those two tool pages ever request these files.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "node_modules", "@neslinesli93", "qpdf-wasm");
const out = join(root, "public", "qpdf");

const files = ["qpdf.js", "qpdf.wasm"];
mkdirSync(out, { recursive: true });
for (const name of files) {
  const src = join(pkg, "dist", name);
  if (!existsSync(src)) {
    console.error(`qpdf asset missing: ${src}. Run npm install first.`);
    process.exit(1);
  }
  copyFileSync(src, join(out, name));
}

const version = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8")).version;
writeFileSync(
  join(out, "NOTICE.txt"),
  [
    `@neslinesli93/qpdf-wasm ${version} — ISC licence — https://github.com/neslinesli93/qpdf-wasm`,
    "qpdf — Copyright (c) 2005-2025 Jay Berkenbilt and Manfred Holger — Apache License 2.0 — https://github.com/qpdf/qpdf",
    "Includes zlib (zlib licence) and libjpeg-turbo (IJG / modified BSD licences).",
    "",
  ].join("\n"),
);

console.log(`Copied qpdf ${version} WebAssembly build to public/qpdf/`);
