import type { ProgressState } from "@/lib/pdf/contracts";

/**
 * Maps tesseract.js logger messages onto the site's ProgressState. Loading the
 * engine and the language model is the slow part on first use, so those stages
 * get honest labels rather than one long anonymous spinner.
 */
export function ocrProgress(status: string, progress: number): ProgressState {
  const fraction = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : null;
  switch (status) {
    case "loading tesseract core":
      return { stage: "parsing", fraction: null, label: "Loading the OCR engine…" };
    case "loading language traineddata":
    case "loading language traineddata (from cache)":
      return { stage: "parsing", fraction, label: "Loading the language model (first use downloads it once)…" };
    case "initializing tesseract":
    case "initializing api":
    case "initialized tesseract":
    case "initialized api":
      return { stage: "parsing", fraction: null, label: "Starting the OCR engine…" };
    case "recognizing text":
      return { stage: "processing", fraction, label: "Reading text from the image…" };
    default:
      return { stage: "processing", fraction: null, label: "Working…" };
  }
}

/**
 * Tesseract works best with characters roughly 20–40 px tall. Small
 * screenshots are upscaled (up to 2×) and huge photos downscaled so a phone
 * picture does not exhaust memory. Returns the scale factor to apply.
 */
export function ocrScale(width: number, height: number): number {
  const longest = Math.max(width, height);
  if (longest <= 0) return 1;
  const MAX_EDGE = 4000;
  const MIN_EDGE = 1200;
  if (longest > MAX_EDGE) return MAX_EDGE / longest;
  if (longest < MIN_EDGE) return Math.min(2, MIN_EDGE / longest);
  return 1;
}
