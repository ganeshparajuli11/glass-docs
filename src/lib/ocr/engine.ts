"use client";

/**
 * Browser OCR engine: tesseract.js running in a Web Worker, with the worker
 * script, WebAssembly core and language models all served from this origin
 * (public/ocr, copied from npm packages at build time). The image never
 * leaves the device; tesseract.js caches language models in IndexedDB so the
 * download happens once per browser.
 *
 * tesseract.js is imported dynamically so it only loads on the OCR tool page.
 */

import type { Worker as TesseractWorker } from "tesseract.js";
import { OCR_ASSET_PATHS } from "./languages";
import { ocrProgress, ocrScale } from "./progress";
import type { ProgressState } from "@/lib/pdf/contracts";

export interface OcrEngine {
  langs: string;
  recognize(image: HTMLCanvasElement): Promise<{ text: string; confidence: number }>;
  terminate(): Promise<void>;
}

export async function createOcrEngine(
  langs: string,
  onProgress: (p: ProgressState) => void,
): Promise<OcrEngine> {
  const { createWorker, OEM } = await import("tesseract.js");
  const worker: TesseractWorker = await createWorker(langs, OEM.LSTM_ONLY, {
    workerPath: OCR_ASSET_PATHS.workerPath,
    corePath: OCR_ASSET_PATHS.corePath,
    langPath: OCR_ASSET_PATHS.langPath,
    // Load the worker script directly (same origin) instead of via a blob URL
    // that would importScripts() it — simpler under the site's CSP.
    workerBlobURL: false,
    gzip: true,
    logger: (m) => onProgress(ocrProgress(m.status, m.progress)),
  });
  return {
    langs,
    async recognize(image) {
      const { data } = await worker.recognize(image);
      return { text: data.text ?? "", confidence: data.confidence ?? 0 };
    },
    async terminate() {
      await worker.terminate();
    },
  };
}

/**
 * Decodes an image (honouring EXIF orientation) and redraws it at a size
 * Tesseract reads well, on a white background so transparent PNG text is not
 * read as black-on-black.
 */
export async function prepareImage(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = ocrScale(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    bitmap.close();
  }
}
