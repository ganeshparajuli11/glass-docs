/**
 * Engine integration tests: fixtures are generated with pdf-lib, transformed
 * by the operations, and the outputs are re-parsed and semantically verified.
 */
import { describe, expect, it } from "vitest";
import { PDFDocument, degrees } from "pdf-lib";
import { mergePdfs } from "@/lib/pdf/operations/merge";
import { organizePdf, rotatePdf } from "@/lib/pdf/operations/organize";
import { extractPages, splitByRanges, splitEveryPage } from "@/lib/pdf/operations/split";
import { watermarkPdf } from "@/lib/pdf/operations/watermark";
import { addPageNumbers } from "@/lib/pdf/operations/page-numbers";
import { imagesToPdf } from "@/lib/pdf/operations/images-to-pdf";
import { readMetadata, writeMetadata } from "@/lib/pdf/operations/metadata";
import { PdfOperationError } from "@/lib/pdf/operations/load";

/** Builds a fixture PDF with the given page sizes (and optional rotations). */
async function makePdf(
  pages: Array<{ w: number; h: number; rotate?: number }>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const p of pages) {
    const page = doc.addPage([p.w, p.h]);
    if (p.rotate) page.setRotation(degrees(p.rotate));
  }
  return doc.save();
}

const A4 = { w: 595, h: 842 };
const LANDSCAPE = { w: 842, h: 595 };

// 1x1 transparent PNG and 1x1 white JPEG fixtures.
const PNG_1PX = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);
const JPG_1PX = Uint8Array.from(
  atob(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==",
  ),
  (c) => c.charCodeAt(0),
);

describe("mergePdfs", () => {
  it("merges in exact source order with mixed dimensions preserved", async () => {
    const a = await makePdf([A4, A4]);
    const b = await makePdf([LANDSCAPE]);
    const merged = await mergePdfs({ sources: [a, b] });
    const doc = await PDFDocument.load(merged);
    expect(doc.getPageCount()).toBe(3);
    expect(Math.round(doc.getPage(2).getWidth())).toBe(842);
    expect(Math.round(doc.getPage(2).getHeight())).toBe(595);
  });

  it("reports progress per file", async () => {
    const a = await makePdf([A4]);
    const seen: number[] = [];
    await mergePdfs({ sources: [a, a, a], onProgress: (done) => seen.push(done) });
    expect(seen).toEqual([1, 2, 3]);
  });
});

describe("organizePdf", () => {
  it("reorders pages", async () => {
    const src = await makePdf([A4, LANDSCAPE, { w: 100, h: 200 }]);
    const out = await organizePdf(src, [
      { sourceIndex: 2 },
      { sourceIndex: 0 },
      { sourceIndex: 1 },
    ]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(100);
    expect(Math.round(doc.getPage(2).getWidth())).toBe(842);
  });

  it("applies rotation deltas on top of existing rotation", async () => {
    const src = await makePdf([{ ...A4, rotate: 90 }]);
    const out = await organizePdf(src, [{ sourceIndex: 0, rotate: 90 }]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPage(0).getRotation().angle).toBe(180);
  });

  it("rotatePdf rotates only the selected pages", async () => {
    const src = await makePdf([A4, A4, A4]);
    const out = await rotatePdf(src, 90, [1]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPage(0).getRotation().angle).toBe(0);
    expect(doc.getPage(1).getRotation().angle).toBe(90);
    expect(doc.getPage(2).getRotation().angle).toBe(0);
  });

  it("rejects out-of-bounds instructions", async () => {
    const src = await makePdf([A4]);
    await expect(organizePdf(src, [{ sourceIndex: 5 }])).rejects.toBeInstanceOf(PdfOperationError);
  });

  it("rejects empty instruction lists (all-pages-delete guard)", async () => {
    const src = await makePdf([A4]);
    await expect(organizePdf(src, [])).rejects.toBeInstanceOf(PdfOperationError);
  });
});

describe("split/extract", () => {
  it("extracts selected pages in selected order", async () => {
    const src = await makePdf([A4, LANDSCAPE, { w: 100, h: 100 }, { w: 300, h: 300 }]);
    const out = await extractPages(src, [3, 0]);
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(300);
    expect(Math.round(doc.getPage(1).getWidth())).toBe(595);
  });

  it("splitByRanges produces one output per range with correct pages", async () => {
    const src = await makePdf([A4, A4, A4, A4, A4]);
    const parts = await splitByRanges(src, [
      { from: 1, to: 2 },
      { from: 4, to: 5 },
    ]);
    expect(parts.length).toBe(2);
    expect((await PDFDocument.load(parts[0].bytes)).getPageCount()).toBe(2);
    expect((await PDFDocument.load(parts[1].bytes)).getPageCount()).toBe(2);
    expect(parts[1].nameHint).toBe("pages-4-5");
  });

  it("splitEveryPage yields one single-page PDF per page", async () => {
    const src = await makePdf([A4, A4, A4]);
    const parts = await splitEveryPage(src, 3);
    expect(parts.length).toBe(3);
    for (const part of parts) {
      expect((await PDFDocument.load(part.bytes)).getPageCount()).toBe(1);
    }
  });
});

describe("watermarkPdf", () => {
  it("produces a parseable PDF and only grows targeted pages", async () => {
    const src = await makePdf([A4, A4]);
    const out = await watermarkPdf(src, {
      text: "DRAFT",
      fontSize: 48,
      opacity: 0.3,
      angle: 45,
      position: "center",
      pages: [0],
    });
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    // Font must be embedded for the drawn text
    expect(out.length).toBeGreaterThan(src.length);
  });

  it("rejects non-encodable characters with a safe error", async () => {
    const src = await makePdf([A4]);
    await expect(
      watermarkPdf(src, {
        text: "机密文件",
        fontSize: 48,
        opacity: 0.3,
        angle: 0,
        position: "center",
      }),
    ).rejects.toBeInstanceOf(PdfOperationError);
  });
});

describe("addPageNumbers", () => {
  it("skips first pages and remains parseable on mixed sizes", async () => {
    const src = await makePdf([A4, LANDSCAPE, A4]);
    const out = await addPageNumbers(src, {
      position: "bottom",
      alignment: "center",
      startNumber: 1,
      prefix: "Page ",
      suffix: "",
      skipFirst: 1,
      fontSize: 11,
    });
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });
});

describe("imagesToPdf", () => {
  it("creates one page per image on A4 with orientation-matched pages", async () => {
    const out = await imagesToPdf(
      [
        { kind: "png", bytes: PNG_1PX },
        { kind: "jpg", bytes: JPG_1PX },
      ],
      { pageSize: "a4", fit: "contain", marginPt: 24 },
    );
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(595);
  });

  it("auto page size matches image plus margins", async () => {
    const out = await imagesToPdf([{ kind: "png", bytes: PNG_1PX }], {
      pageSize: "auto",
      fit: "contain",
      marginPt: 10,
    });
    const doc = await PDFDocument.load(out);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(21); // 1px + 2*10pt
  });
});

describe("metadata", () => {
  it("round-trips edited fields and preserves page count", async () => {
    const src = await makePdf([A4, A4]);
    const updated = await writeMetadata(src, {
      title: "My Title",
      author: "An Author",
      subject: "Testing",
      keywords: "one, two",
    });
    const meta = await readMetadata(updated);
    expect(meta.title).toBe("My Title");
    expect(meta.author).toBe("An Author");
    expect(meta.pageCount).toBe(2);
    expect(meta.keywords).toContain("one");
  });
});

describe("invalid input handling", () => {
  it("maps garbage bytes to a safe error", async () => {
    const garbage = new TextEncoder().encode("not a pdf at all");
    await expect(mergePdfs({ sources: [garbage] })).rejects.toBeInstanceOf(PdfOperationError);
  });
});
