"use client";

/**
 * PdfJsAdapter — lazy loader for pdfjs-dist. Rendering, document info,
 * and text extraction. The worker is served same-origin from /public.
 */

import type { PDFDocumentProxy } from "pdfjs-dist";
import { mapEngineError, toolError, type ToolError } from "./errors";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export async function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsPromise;
}

export class PdfOpenError extends Error {
  toolError: ToolError;
  constructor(toolErr: ToolError) {
    super(toolErr.message);
    this.name = "PdfOpenError";
    this.toolError = toolErr;
  }
}

export async function openDocument(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  try {
    // pdf.js transfers the buffer to its worker; pass a copy.
    return await pdfjs.getDocument({ data: bytes.slice() }).promise;
  } catch (err) {
    if (err && typeof err === "object" && err.constructor?.name === "PasswordException") {
      throw new PdfOpenError(toolError("PDF_ENCRYPTED_UNSUPPORTED"));
    }
    throw new PdfOpenError(mapEngineError(err));
  }
}

export interface RenderedPage {
  pageNumber: number;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
}

export async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<RenderedPage> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PdfOpenError(toolError("BROWSER_UNSUPPORTED"));
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return { pageNumber, width: canvas.width, height: canvas.height, canvas };
}

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
}

export async function extractPageText(
  doc: PDFDocumentProxy,
  pageNumber: number,
): Promise<ExtractedPageText> {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  const text = content.items
    .map((item) => ("str" in item ? item.str : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  page.cleanup();
  return { pageNumber, text };
}

export interface PdfDocumentInfo {
  pageCount: number;
  pdfVersion: string | null;
  pageSizes: Array<{ pageNumber: number; widthPt: number; heightPt: number }>;
}

export async function readDocumentInfo(doc: PDFDocumentProxy): Promise<PdfDocumentInfo> {
  const meta = (await doc.getMetadata().catch(() => null)) as {
    info?: { PDFFormatVersion?: string };
  } | null;
  const sample = Math.min(doc.numPages, 25);
  const pageSizes: PdfDocumentInfo["pageSizes"] = [];
  for (let i = 1; i <= sample; i += 1) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    pageSizes.push({
      pageNumber: i,
      widthPt: Math.round(vp.width),
      heightPt: Math.round(vp.height),
    });
    page.cleanup();
  }
  return {
    pageCount: doc.numPages,
    pdfVersion: meta?.info?.PDFFormatVersion ?? null,
    pageSizes,
  };
}

/** Releases worker/document resources for a document proxy. */
export async function destroyDocument(doc: PDFDocumentProxy): Promise<void> {
  try {
    await doc.loadingTask.destroy();
  } catch {
    // already destroyed
  }
}
