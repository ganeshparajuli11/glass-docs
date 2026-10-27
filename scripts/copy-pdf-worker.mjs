// Copies the pdf.js worker into public/ so it can be served same-origin
// without bundler-specific worker handling, plus pdf.js's image decoders
// (JBIG2/CCITT fax, JPEG 2000, ICC colour) into public/pdfjs/wasm. Since
// pdf.js 5 those decoders are WebAssembly modules (with JS fallbacks) loaded
// from the `wasmUrl` option; without them, black-and-white office-scanner
// pages (CCITT G4 / JBIG2) and JPEG 2000 images render blank.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "node_modules", "pdfjs-dist");
const src = join(pkg, "build", "pdf.worker.min.mjs");
const dest = join(root, "public", "pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.error("pdfjs-dist worker not found. Run npm install first.");
  process.exit(1);
}
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log("Copied pdf.worker.min.mjs to public/");

// Keep in sync with PDFJS_WASM_URL in src/lib/pdf/pdfjs.ts (git-ignored output).
const WASM_FILES = [
  "jbig2.wasm",
  "jbig2_nowasm_fallback.js",
  "openjpeg.wasm",
  "openjpeg_nowasm_fallback.js",
  "qcms_bg.wasm",
  "LICENSE_JBIG2",
  "LICENSE_PDFJS_JBIG2",
  "LICENSE_OPENJPEG",
  "LICENSE_PDFJS_OPENJPEG",
  "LICENSE_QCMS",
  "LICENSE_PDFJS_QCMS",
];
const wasmDir = join(root, "public", "pdfjs", "wasm");
mkdirSync(wasmDir, { recursive: true });
for (const name of WASM_FILES) {
  const from = join(pkg, "wasm", name);
  if (!existsSync(from)) {
    console.error(`pdfjs-dist/wasm/${name} not found. Run npm install first.`);
    process.exit(1);
  }
  copyFileSync(from, join(wasmDir, name));
}
console.log(`Copied ${WASM_FILES.length} pdf.js decoder files to public/pdfjs/wasm/`);
