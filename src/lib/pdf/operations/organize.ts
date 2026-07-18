import { PDFDocument, degrees } from "pdf-lib";
import { loadPdf, savePdf, PdfOperationError } from "./load";
import { toolError } from "../errors";

export interface PageInstruction {
  /** Zero-based index into the source document. */
  sourceIndex: number;
  /** Extra clockwise rotation in degrees (0/90/180/270). */
  rotate?: 0 | 90 | 180 | 270;
}

/**
 * Single engine for reorder / delete / extract / rotate:
 * the output contains exactly the listed pages, in order, with rotation applied.
 */
export async function organizePdf(
  source: Uint8Array,
  instructions: PageInstruction[],
): Promise<Uint8Array> {
  if (instructions.length === 0) {
    throw new PdfOperationError(toolError("PAGE_RANGE_INVALID"));
  }
  const src = await loadPdf(source);
  const count = src.getPageCount();
  for (const inst of instructions) {
    if (inst.sourceIndex < 0 || inst.sourceIndex >= count) {
      throw new PdfOperationError(toolError("PAGE_RANGE_INVALID"));
    }
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    src,
    instructions.map((i) => i.sourceIndex),
  );
  copied.forEach((page, i) => {
    const extra = instructions[i].rotate ?? 0;
    if (extra !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees(((current + extra) % 360 + 360) % 360));
    }
    out.addPage(page);
  });
  return savePdf(out);
}

/** Convenience: rotate the given zero-based pages (or all) by a delta. */
export async function rotatePdf(
  source: Uint8Array,
  delta: 90 | 180 | 270,
  pageIndices?: number[],
): Promise<Uint8Array> {
  const src = await loadPdf(source);
  const count = src.getPageCount();
  const targets = new Set(pageIndices ?? Array.from({ length: count }, (_, i) => i));
  const instructions: PageInstruction[] = Array.from({ length: count }, (_, i) => ({
    sourceIndex: i,
    rotate: targets.has(i) ? delta : 0,
  }));
  return organizePdf(source, instructions);
}
