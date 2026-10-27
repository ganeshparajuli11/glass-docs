/**
 * Pure helpers for OCR of scanned PDFs: which pages to read, how large to
 * render them, whether a page already carries real text, and how to stitch
 * the per-page results into one document. The browser side (pdf.js render +
 * tesseract.js) lives in the feature component; everything here is testable
 * without a DOM.
 */

import { parsePageRanges } from "@/lib/pdf/ranges";
import { formatOcrText, type LayoutMode } from "./text";

/** Scanners and OCR engines are tuned for ~300 DPI pages. */
export const OCR_TARGET_DPI = 300;
/** Longest rendered edge, in pixels — keeps a poster-sized page from exhausting memory. */
export const OCR_MAX_RENDER_EDGE = 4000;
/**
 * Pages per run. OCR costs several seconds a page on a laptop and more on a
 * phone; beyond this a browser tab is the wrong place to do it in one go.
 */
export const MAX_OCR_PAGES = 50;
/**
 * A page needs at least this many letters/digits in its text layer before we
 * trust it instead of running OCR. Scans often carry a short stamped footer
 * ("Scanned with …") or a page number as real text; that must not count.
 */
export const MIN_TEXT_LAYER_CHARS = 40;

/** pdf.js viewport scale that renders a page at ~300 DPI, capped by edge length. */
export function pdfOcrScale(widthPt: number, heightPt: number): number {
  const target = OCR_TARGET_DPI / 72;
  const longestPt = Math.max(widthPt, heightPt);
  if (!Number.isFinite(longestPt) || longestPt <= 0) return target;
  return Math.min(target, OCR_MAX_RENDER_EDGE / longestPt);
}

export type PageSelection =
  | { ok: true; pages: number[] }
  | { ok: false; message: string };

/**
 * Turns the page-range box into one-based page numbers. Empty means every
 * page. More than MAX_OCR_PAGES is refused with a message suggesting a range,
 * rather than silently cutting the document short.
 */
export function selectOcrPages(input: string, pageCount: number): PageSelection {
  if (pageCount < 1) return { ok: false, message: "This PDF has no pages." };
  const trimmed = input.trim();
  let pages: number[];
  if (trimmed.length === 0) {
    pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  } else {
    const parsed = parsePageRanges(trimmed, pageCount);
    if (!parsed.ok) {
      return {
        ok: false,
        message: `Check the page range: ${parsed.invalidTokens.filter(Boolean).join(", ") || "it is empty"}. The PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}; use a format like 1-3, 5.`,
      };
    }
    pages = parsed.pages.map((i) => i + 1);
  }
  if (pages.length > MAX_OCR_PAGES) {
    return {
      ok: false,
      message: `That is ${pages.length} pages. Read up to ${MAX_OCR_PAGES} at a time — for example 1-${MAX_OCR_PAGES}, then ${MAX_OCR_PAGES + 1}-${Math.min(pageCount, MAX_OCR_PAGES * 2)}.`,
    };
  }
  return { ok: true, pages };
}

export interface TextItemLike {
  str?: string;
  hasEOL?: boolean;
}

/** Rebuilds line breaks from pdf.js text-content items (hasEOL marks a line end). */
export function textFromItems(items: readonly TextItemLike[]): string {
  let out = "";
  for (const item of items) {
    if (typeof item.str === "string") out += item.str;
    if (item.hasEOL) out += "\n";
  }
  return out
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** True when a page's own text layer has enough real characters to use as-is. */
export function hasUsableTextLayer(text: string): boolean {
  const meaningful = text.match(/[\p{L}\p{M}\p{N}]/gu);
  return (meaningful?.length ?? 0) >= MIN_TEXT_LAYER_CHARS;
}

export interface PdfPageResult {
  pageNumber: number;
  text: string;
  /** Where the words came from: the PDF's own text, or recognition. */
  source: "text-layer" | "ocr";
  /** Tesseract mean confidence for OCR pages; null for text-layer pages. */
  confidence: number | null;
}

export interface CombineOptions {
  layout: LayoutMode;
  /** Prefix each page with a "--- Page N ---" line. */
  markers: boolean;
}

/** Joins per-page results into one text, in page order. */
export function combinePageTexts(
  pages: readonly PdfPageResult[],
  { layout, markers }: CombineOptions,
): string {
  const parts: string[] = [];
  for (const page of [...pages].sort((a, b) => a.pageNumber - b.pageNumber)) {
    const body = formatOcrText(page.text, layout);
    if (markers) {
      parts.push(`--- Page ${page.pageNumber} ---\n${body.length > 0 ? body : "(no text found)"}`);
    } else if (body.length > 0) {
      parts.push(body);
    }
  }
  return parts.join("\n\n");
}

export interface PdfOcrSummary {
  ocrPages: number;
  textLayerPages: number;
  emptyPages: number[];
  /** Character-weighted mean confidence over OCR pages (0–100), or null if none were OCR'd. */
  confidence: number | null;
}

export function summarisePdfOcr(pages: readonly PdfPageResult[]): PdfOcrSummary {
  let ocrPages = 0;
  let textLayerPages = 0;
  const emptyPages: number[] = [];
  let weighted = 0;
  let weight = 0;
  for (const page of pages) {
    const chars = page.text.trim().length;
    if (chars === 0) emptyPages.push(page.pageNumber);
    if (page.source === "text-layer") {
      textLayerPages += 1;
      continue;
    }
    ocrPages += 1;
    if (page.confidence !== null && Number.isFinite(page.confidence) && chars > 0) {
      weighted += page.confidence * chars;
      weight += chars;
    }
  }
  return {
    ocrPages,
    textLayerPages,
    emptyPages: emptyPages.sort((a, b) => a - b),
    confidence: ocrPages === 0 ? null : weight === 0 ? 0 : weighted / weight,
  };
}

/** "pages 2, 5 and 7" — for honest summaries of what came back empty. */
export function listPages(pages: readonly number[]): string {
  if (pages.length === 0) return "";
  const label = pages.length === 1 ? "page" : "pages";
  if (pages.length === 1) return `${label} ${pages[0]}`;
  return `${label} ${pages.slice(0, -1).join(", ")} and ${pages[pages.length - 1]}`;
}
