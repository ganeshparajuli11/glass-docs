import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  downloadSizeMb,
  isOcrLanguage,
  OCR_ASSET_PATHS,
  OCR_LANGUAGES,
  toTesseractLangs,
} from "@/lib/ocr/languages";
import { ocrProgress, ocrScale } from "@/lib/ocr/progress";
import {
  countWords,
  formatOcrText,
  joinParagraphs,
  summariseConfidence,
  tidyOcrText,
} from "@/lib/ocr/text";

describe("OCR languages", () => {
  it("builds Tesseract language strings in a stable order", () => {
    expect(toTesseractLangs(["eng"])).toBe("eng");
    expect(toTesseractLangs(["hin", "eng"])).toBe("eng+hin");
    expect(toTesseractLangs(["nep", "nep"])).toBe("nep");
  });

  it("falls back to English and drops unknown codes", () => {
    expect(toTesseractLangs([])).toBe("eng");
    expect(toTesseractLangs(["fra", "../../etc"])).toBe("eng");
    expect(isOcrLanguage("fra")).toBe(false);
  });

  it("caps the selection at two models", () => {
    expect(toTesseractLangs(["eng", "nep", "hin"])).toBe("eng+nep");
  });

  it("reports first-use download size", () => {
    expect(downloadSizeMb("eng")).toBe(2.9);
    expect(downloadSizeMb("nep+hin")).toBe(3);
  });

  it("serves every asset from this origin, never a CDN", () => {
    for (const path of Object.values(OCR_ASSET_PATHS)) {
      expect(path.startsWith("/")).toBe(true);
      expect(path).not.toMatch(/^\/\//);
    }
  });

  it("ships a language model package for every listed language", () => {
    const root = join(__dirname, "..", "..");
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
    };
    for (const lang of OCR_LANGUAGES) {
      expect(pkg.dependencies[`@tesseract.js-data/${lang.code}`]).toBeDefined();
      expect(
        existsSync(join(root, "node_modules", "@tesseract.js-data", lang.code, "4.0.0_best_int", `${lang.code}.traineddata.gz`)),
      ).toBe(true);
    }
  });
});

describe("OCR text formatting", () => {
  it("tidies whitespace and caps blank runs", () => {
    expect(tidyOcrText("  Hello  \r\n\r\n\r\n\nWorld  \n")).toBe("Hello\n\nWorld");
  });

  it("keeps printed line breaks in lines mode", () => {
    expect(formatOcrText("Line one\nLine two\n", "lines")).toBe("Line one\nLine two");
  });

  it("joins wrapped lines into paragraphs", () => {
    const raw = "The quick brown\nfox jumps over\nthe lazy dog.\n\nSecond para\ngraph here.";
    expect(joinParagraphs(raw)).toBe("The quick brown fox jumps over the lazy dog.\n\nSecond para graph here.");
  });

  it("rejoins words hyphenated at a line end", () => {
    expect(joinParagraphs("An exam-\nple of hyphen-\nation.")).toBe("An example of hyphenation.");
  });

  it("does not eat a hyphen that follows a digit or space", () => {
    expect(joinParagraphs("Pages 10-\n12 only")).toBe("Pages 10- 12 only");
  });

  it("keeps list items on their own lines", () => {
    const raw = "Bring:\n- a pen\n- your ID card\n1. Arrive early\n2) Sign in";
    expect(joinParagraphs(raw)).toBe("Bring:\n- a pen\n- your ID card\n1. Arrive early\n2) Sign in");
  });

  it("handles Devanagari text", () => {
    expect(joinParagraphs("नेपाल एक सुन्दर\nदेश हो।")).toBe("नेपाल एक सुन्दर देश हो।");
  });

  it("counts words", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("  one two\nthree ")).toBe(3);
  });
});

describe("OCR confidence summary", () => {
  it("grades confidence conservatively", () => {
    expect(summariseConfidence(92.4, 100)).toMatchObject({ score: 92, level: "good" });
    expect(summariseConfidence(70, 100).level).toBe("fair");
    expect(summariseConfidence(40, 100).level).toBe("poor");
  });

  it("treats empty output as poor regardless of score", () => {
    const s = summariseConfidence(95, 0);
    expect(s.level).toBe("poor");
    expect(s.advice).toMatch(/No text was recognised/);
  });

  it("clamps nonsense input", () => {
    expect(summariseConfidence(Number.NaN, 5).score).toBe(0);
    expect(summariseConfidence(140, 5).score).toBe(100);
  });
});

describe("OCR progress and scaling", () => {
  it("labels the slow first-use stages honestly", () => {
    expect(ocrProgress("loading tesseract core", 0).label).toMatch(/engine/);
    expect(ocrProgress("loading language traineddata", 0.5)).toMatchObject({ fraction: 0.5 });
    expect(ocrProgress("recognizing text", 0.25)).toEqual({
      stage: "processing",
      fraction: 0.25,
      label: "Reading text from the image…",
    });
    expect(ocrProgress("something new", 2).fraction).toBeNull();
  });

  it("upscales small screenshots at most 2x", () => {
    expect(ocrScale(400, 300)).toBe(2);
    expect(ocrScale(800, 200)).toBeCloseTo(1.5);
  });

  it("downscales huge photos and leaves normal images alone", () => {
    expect(ocrScale(8000, 6000)).toBe(0.5);
    expect(ocrScale(2000, 1500)).toBe(1);
    expect(ocrScale(0, 0)).toBe(1);
  });
});
