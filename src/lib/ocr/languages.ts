/**
 * OCR languages that ship with the site. Each one is a Tesseract LSTM model
 * (`4.0.0_best_int` from the @tesseract.js-data npm packages) copied into
 * public/ocr/lang at build time by scripts/copy-ocr-assets.mjs and served from
 * this origin — never from a CDN.
 */

export interface OcrLanguage {
  /** Tesseract language code, also the traineddata file stem. */
  code: "eng" | "nep" | "hin";
  label: string;
  script: "Latin" | "Devanagari";
  /** Download size of the gzipped model, for honest UI copy. */
  approxDownloadMb: number;
}

export const OCR_LANGUAGES: readonly OcrLanguage[] = [
  { code: "eng", label: "English", script: "Latin", approxDownloadMb: 2.9 },
  { code: "nep", label: "Nepali (नेपाली)", script: "Devanagari", approxDownloadMb: 1.6 },
  { code: "hin", label: "Hindi (हिन्दी)", script: "Devanagari", approxDownloadMb: 1.4 },
];

export type OcrLanguageCode = OcrLanguage["code"];

/** Same-origin asset locations. Keep in sync with scripts/copy-ocr-assets.mjs. */
export const OCR_ASSET_PATHS = {
  workerPath: "/ocr/worker.min.js",
  corePath: "/ocr/core",
  langPath: "/ocr/lang",
} as const;

export const MAX_OCR_LANGUAGES = 2;

export function isOcrLanguage(code: string): code is OcrLanguageCode {
  return OCR_LANGUAGES.some((l) => l.code === code);
}

/**
 * Normalises a selection into the `eng+nep` form Tesseract expects:
 * known codes only, no duplicates, registry order, at most two (each extra
 * model slows recognition and adds a download), and English when empty.
 */
export function toTesseractLangs(selected: readonly string[]): string {
  const wanted = new Set(selected.filter(isOcrLanguage));
  const ordered = OCR_LANGUAGES.map((l) => l.code).filter((c) => wanted.has(c));
  const picked = ordered.slice(0, MAX_OCR_LANGUAGES);
  return (picked.length > 0 ? picked : ["eng"]).join("+");
}

/** Total first-use download for a language string such as `eng+hin`. */
export function downloadSizeMb(langs: string): number {
  const codes = langs.split("+");
  const total = OCR_LANGUAGES.filter((l) => codes.includes(l.code)).reduce(
    (n, l) => n + l.approxDownloadMb,
    0,
  );
  return Math.round(total * 10) / 10;
}
