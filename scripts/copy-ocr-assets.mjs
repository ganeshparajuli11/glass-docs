// Copies the OCR engine (tesseract.js worker, WebAssembly core) and the
// language models into public/ocr so they are served from this origin —
// never from a CDN. Output is git-ignored and rebuilt on every build.
//
// Only the LSTM-only cores are copied (the tool always uses OEM.LSTM_ONLY);
// tesseract.js picks relaxed-SIMD, SIMD or plain at runtime, so a visitor
// downloads exactly one of them.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = join(root, "node_modules");
const out = join(root, "public", "ocr");

const files = [
  [join(nm, "tesseract.js", "dist", "worker.min.js"), join(out, "worker.min.js")],
  ...["tesseract-core-relaxedsimd-lstm", "tesseract-core-simd-lstm", "tesseract-core-lstm"].map(
    (stem) => [join(nm, "tesseract.js-core", `${stem}.wasm.js`), join(out, "core", `${stem}.wasm.js`)],
  ),
  ...["eng", "nep", "hin"].map((lang) => [
    join(nm, "@tesseract.js-data", lang, "4.0.0_best_int", `${lang}.traineddata.gz`),
    join(out, "lang", `${lang}.traineddata.gz`),
  ]),
];

for (const [src, dest] of files) {
  if (!existsSync(src)) {
    console.error(`OCR asset missing: ${src}. Run npm install first.`);
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

// The worker must be built for the same core major version we ship.
const coreVersion = JSON.parse(readFileSync(join(nm, "tesseract.js-core", "package.json"), "utf8")).version;
const wanted = JSON.parse(readFileSync(join(nm, "tesseract.js", "package.json"), "utf8")).dependencies["tesseract.js-core"];
if (coreVersion.split(".")[0] !== wanted.replace(/^\D*/, "").split(".")[0]) {
  console.error(`tesseract.js-core ${coreVersion} does not match tesseract.js requirement ${wanted}`);
  process.exit(1);
}

console.log(`Copied ${files.length} OCR assets to public/ocr (core ${coreVersion})`);
