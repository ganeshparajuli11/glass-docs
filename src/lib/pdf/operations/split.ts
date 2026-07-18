import { organizePdf } from "./organize";

export interface SplitPart {
  /** Suggested file name (without extension). */
  nameHint: string;
  bytes: Uint8Array;
}

/** One combined PDF containing the selected zero-based pages, in order. */
export async function extractPages(
  source: Uint8Array,
  pages: number[],
): Promise<Uint8Array> {
  return organizePdf(source, pages.map((sourceIndex) => ({ sourceIndex })));
}

/** One output PDF per one-based range. */
export async function splitByRanges(
  source: Uint8Array,
  ranges: Array<{ from: number; to: number }>,
  onProgress?: (done: number, total: number) => void,
): Promise<SplitPart[]> {
  const parts: SplitPart[] = [];
  let done = 0;
  for (const { from, to } of ranges) {
    const pages = [];
    for (let p = from; p <= to; p += 1) pages.push(p - 1);
    const bytes = await extractPages(source, pages);
    parts.push({ nameHint: from === to ? `page-${from}` : `pages-${from}-${to}`, bytes });
    done += 1;
    onProgress?.(done, ranges.length);
  }
  return parts;
}

/** Every page becomes its own PDF. */
export async function splitEveryPage(
  source: Uint8Array,
  pageCount: number,
  onProgress?: (done: number, total: number) => void,
): Promise<SplitPart[]> {
  const ranges = Array.from({ length: pageCount }, (_, i) => ({ from: i + 1, to: i + 1 }));
  return splitByRanges(source, ranges, onProgress);
}
