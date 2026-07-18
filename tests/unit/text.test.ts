import { describe, expect, it } from "vitest";
import { analyzeText } from "@/lib/text/analyze";
import { convertCase, removeDuplicateLines, removeExtraSpaces } from "@/lib/text/transform";
import { diffLines, similarityPercent } from "@/lib/text/diff";

describe("analyzeText", () => {
  it("counts words, sentences, paragraphs", () => {
    const s = analyzeText("Hello world. This is a test!\n\nNew paragraph here.");
    expect(s.words).toBe(9);
    expect(s.sentences).toBe(3);
    expect(s.paragraphs).toBe(2);
  });

  it("handles empty input", () => {
    const s = analyzeText("");
    expect(s.words).toBe(0);
    expect(s.sentences).toBe(0);
    expect(s.pagesDoubleSpaced).toBe(0);
  });
});

describe("convertCase", () => {
  it("title-cases across separators", () => {
    expect(convertCase("hello world-wide (web)", "title")).toBe("Hello World-Wide (Web)");
  });
  it("sentence-cases after punctuation", () => {
    expect(convertCase("first. second? THIRD!", "sentence")).toBe("First. Second? Third!");
  });
});

describe("removeExtraSpaces", () => {
  it("collapses runs and blank lines", () => {
    expect(removeExtraSpaces("a   b\t c \n\n\n\nd")).toBe("a b c\n\nd");
  });
});

describe("removeDuplicateLines", () => {
  it("dedupes case-insensitively and sorts when asked", () => {
    expect(
      removeDuplicateLines("Beta\nalpha\nBETA\nAlpha", { caseSensitive: false, sort: true }),
    ).toBe("alpha\nBeta");
  });
});

describe("diffLines", () => {
  it("classifies added/removed/same and computes similarity", () => {
    const d = diffLines("a\nb\nc", "a\nx\nc");
    expect(d).toEqual([
      { type: "same", text: "a" },
      { type: "removed", text: "b" },
      { type: "added", text: "x" },
      { type: "same", text: "c" },
    ]);
    expect(similarityPercent(d)).toBe(50);
  });
});
