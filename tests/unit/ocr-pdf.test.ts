import { describe, expect, it } from "vitest";
import {
  combinePageTexts,
  hasUsableTextLayer,
  listPages,
  MAX_OCR_PAGES,
  OCR_MAX_RENDER_EDGE,
  pdfOcrScale,
  selectOcrPages,
  summarisePdfOcr,
  textFromItems,
  type PdfPageResult,
} from "@/lib/ocr/pdf";

describe("pdfOcrScale", () => {
  it("renders an A4 or Letter page at about 300 DPI", () => {
    const s = pdfOcrScale(612, 792);
    expect(s).toBeCloseTo(300 / 72, 5);
    expect(Math.round(612 * s)).toBe(2550);
  });

  it("caps very large pages at the maximum edge", () => {
    const s = pdfOcrScale(1684, 2384); // A1
    expect(Math.round(2384 * s)).toBe(OCR_MAX_RENDER_EDGE);
  });

  it("falls back to the target scale for broken page sizes", () => {
    expect(pdfOcrScale(0, 0)).toBeCloseTo(300 / 72, 5);
    expect(pdfOcrScale(Number.NaN, 10)).toBeCloseTo(300 / 72, 5);
  });
});

describe("selectOcrPages", () => {
  it("takes every page when the box is empty", () => {
    expect(selectOcrPages("  ", 3)).toEqual({ ok: true, pages: [1, 2, 3] });
  });

  it("parses ranges into one-based pages in the order given", () => {
    expect(selectOcrPages("3, 1-2", 5)).toEqual({ ok: true, pages: [3, 1, 2] });
  });

  it("explains an invalid range", () => {
    const r = selectOcrPages("2-9", 4);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/2-9.*4 pages/);
  });

  it("refuses more than the per-run limit instead of truncating", () => {
    const r = selectOcrPages("", MAX_OCR_PAGES + 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain(`1-${MAX_OCR_PAGES}`);
    expect(selectOcrPages(`1-${MAX_OCR_PAGES}`, 200).ok).toBe(true);
  });

  it("rejects an empty document", () => {
    expect(selectOcrPages("", 0).ok).toBe(false);
  });
});

describe("textFromItems", () => {
  it("rebuilds lines from end-of-line markers", () => {
    const items = [
      { str: "Dear  student,", hasEOL: true },
      { str: "your result", hasEOL: false },
      { str: " is ready.", hasEOL: true },
      { str: "", hasEOL: true },
      { str: "", hasEOL: true },
      { str: "", hasEOL: true },
      { str: "Regards" },
    ];
    expect(textFromItems(items)).toBe("Dear student,\nyour result is ready.\n\nRegards");
  });

  it("ignores marked-content items without a string", () => {
    expect(textFromItems([{ hasEOL: false }, { str: "A" }])).toBe("A");
  });
});

describe("hasUsableTextLayer", () => {
  it("ignores a short stamped footer on a scan", () => {
    expect(hasUsableTextLayer("Scanned with a phone app   12")).toBe(false);
    expect(hasUsableTextLayer("")).toBe(false);
  });

  it("accepts a page of real text, including Devanagari", () => {
    expect(hasUsableTextLayer("The quick brown fox jumps over the lazy dog again and again.")).toBe(true);
    expect(hasUsableTextLayer("नेपाल एक सुन्दर देश हो। यहाँ हिमाल पहाड र तराई छन्। नेपाल एक सुन्दर देश हो।")).toBe(true);
  });
});

const pages: PdfPageResult[] = [
  { pageNumber: 2, text: "Second page line one\nline two", source: "ocr", confidence: 80 },
  { pageNumber: 1, text: "First page", source: "text-layer", confidence: null },
  { pageNumber: 3, text: "   ", source: "ocr", confidence: 10 },
];

describe("combinePageTexts", () => {
  it("orders pages and adds markers, flagging empty pages", () => {
    expect(combinePageTexts(pages, { layout: "lines", markers: true })).toBe(
      "--- Page 1 ---\nFirst page\n\n--- Page 2 ---\nSecond page line one\nline two\n\n--- Page 3 ---\n(no text found)",
    );
  });

  it("drops empty pages without markers and can join paragraphs", () => {
    expect(combinePageTexts(pages, { layout: "paragraphs", markers: false })).toBe(
      "First page\n\nSecond page line one line two",
    );
  });
});

describe("summarisePdfOcr", () => {
  it("counts sources and weights confidence by recognised characters", () => {
    const s = summarisePdfOcr([
      { pageNumber: 1, text: "a".repeat(300), source: "ocr", confidence: 90 },
      { pageNumber: 2, text: "b".repeat(100), source: "ocr", confidence: 50 },
      { pageNumber: 3, text: "real text", source: "text-layer", confidence: null },
      { pageNumber: 4, text: "", source: "ocr", confidence: 0 },
    ]);
    expect(s.ocrPages).toBe(3);
    expect(s.textLayerPages).toBe(1);
    expect(s.emptyPages).toEqual([4]);
    expect(s.confidence).toBeCloseTo(80, 5);
  });

  it("reports no confidence when nothing needed OCR", () => {
    expect(summarisePdfOcr([{ pageNumber: 1, text: "x", source: "text-layer", confidence: null }]).confidence).toBeNull();
  });
});

describe("listPages", () => {
  it("reads naturally", () => {
    expect(listPages([])).toBe("");
    expect(listPages([4])).toBe("page 4");
    expect(listPages([2, 5, 7])).toBe("pages 2, 5 and 7");
  });
});
