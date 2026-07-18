/**
 * Page-range parsing. UI is one-based ("1-3, 5"), engine is zero-based.
 */

export interface RangeParseOk {
  ok: true;
  /** Zero-based page indices in the order selected (duplicates removed). */
  pages: number[];
  /** One-based ranges as parsed, for per-range output modes. */
  ranges: Array<{ from: number; to: number }>;
}

export interface RangeParseError {
  ok: false;
  /** The exact tokens that were invalid. */
  invalidTokens: string[];
}

export type RangeParseResult = RangeParseOk | RangeParseError;

/**
 * Parses expressions like "1-3, 5, 8-10" against a document page count.
 * Reversed ranges (e.g. "7-4") are invalid.
 */
export function parsePageRanges(input: string, pageCount: number): RangeParseResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: false, invalidTokens: [""] };

  const tokens = trimmed.split(",").map((t) => t.trim());
  const invalidTokens: string[] = [];
  const ranges: Array<{ from: number; to: number }> = [];

  for (const token of tokens) {
    if (token.length === 0) {
      invalidTokens.push(token);
      continue;
    }
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token);
    if (!match) {
      invalidTokens.push(token);
      continue;
    }
    const from = Number.parseInt(match[1], 10);
    const to = match[2] !== undefined ? Number.parseInt(match[2], 10) : from;
    if (from < 1 || to < 1 || from > pageCount || to > pageCount || from > to) {
      invalidTokens.push(token);
      continue;
    }
    ranges.push({ from, to });
  }

  if (invalidTokens.length > 0) return { ok: false, invalidTokens };

  const seen = new Set<number>();
  const pages: number[] = [];
  for (const { from, to } of ranges) {
    for (let p = from; p <= to; p += 1) {
      const idx = p - 1;
      if (!seen.has(idx)) {
        seen.add(idx);
        pages.push(idx);
      }
    }
  }
  return { ok: true, pages, ranges };
}
