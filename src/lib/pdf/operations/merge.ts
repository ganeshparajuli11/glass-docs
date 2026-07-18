import { PDFDocument } from "pdf-lib";
import { loadPdf, savePdf } from "./load";

export interface MergeInput {
  /** Source PDFs in the order they should appear in the output. */
  sources: Uint8Array[];
  onProgress?: (done: number, total: number) => void;
}

/** Merges PDFs preserving page dimensions and rotation. */
export async function mergePdfs({ sources, onProgress }: MergeInput): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  let done = 0;
  for (const bytes of sources) {
    const src = await loadPdf(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const page of pages) out.addPage(page);
    done += 1;
    onProgress?.(done, sources.length);
  }
  return savePdf(out);
}
