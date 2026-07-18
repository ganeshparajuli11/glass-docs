import { describe, expect, it } from "vitest";
import { parsePageRanges } from "@/lib/pdf/ranges";

describe("parsePageRanges", () => {
  it("parses single pages and spans in order", () => {
    const r = parsePageRanges("1-3, 5, 8-10", 12);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.pages).toEqual([0, 1, 2, 4, 7, 8, 9]);
      expect(r.ranges).toEqual([
        { from: 1, to: 3 },
        { from: 5, to: 5 },
        { from: 8, to: 10 },
      ]);
    }
  });

  it("removes duplicate pages but keeps first-seen order", () => {
    const r = parsePageRanges("3, 1-4", 5);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.pages).toEqual([2, 0, 1, 3]);
  });

  it("reports the exact invalid tokens", () => {
    const r = parsePageRanges("1-3, x, 99, 7-4", 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.invalidTokens).toEqual(["x", "99", "7-4"]);
  });

  it("rejects empty input", () => {
    expect(parsePageRanges("", 5).ok).toBe(false);
    expect(parsePageRanges("  ", 5).ok).toBe(false);
  });

  it("rejects out-of-bounds and zero pages", () => {
    expect(parsePageRanges("0", 5).ok).toBe(false);
    expect(parsePageRanges("6", 5).ok).toBe(false);
  });
});
