/**
 * Pure post-processing for OCR output. Tesseract returns one line of text per
 * printed line, with a hard line break wherever the original wrapped. That is
 * right for receipts, tables and code, and wrong for prose you want to paste
 * into a document — so the tool offers both, and both are implemented here.
 */

export type LayoutMode = "lines" | "paragraphs";

/** Trims line ends, normalises newlines and caps blank runs at one empty line. */
export function tidyOcrText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").replace(/^[ \t]+/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** A line that ends with a letter + hyphen was almost always split mid-word. */
const HYPHEN_BREAK = /(\p{L})-$/u;

/**
 * Joins wrapped lines into paragraphs. Blank lines stay as paragraph breaks.
 * Lines ending in "word-" are rejoined without the hyphen; lines that look like
 * list items keep their own line so bullet lists survive.
 */
export function joinParagraphs(text: string): string {
  const paragraphs = tidyOcrText(text).split(/\n\n/);
  return paragraphs
    .map((para) => {
      const lines = para.split("\n").filter((l) => l.length > 0);
      let out = "";
      for (const line of lines) {
        if (out.length === 0) {
          out = line;
        } else if (isListItem(line)) {
          out += `\n${line}`;
        } else if (HYPHEN_BREAK.test(out)) {
          out = out.slice(0, -1) + line;
        } else {
          out += ` ${line}`;
        }
      }
      return out;
    })
    .filter((p) => p.length > 0)
    .join("\n\n");
}

function isListItem(line: string): boolean {
  return /^([-•*·▪●]|\d{1,3}[.)]|[a-z][.)])\s/u.test(line);
}

export function formatOcrText(raw: string, mode: LayoutMode): string {
  return mode === "paragraphs" ? joinParagraphs(raw) : tidyOcrText(raw);
}

export interface ConfidenceSummary {
  /** 0–100, Tesseract's mean word confidence, rounded. */
  score: number;
  level: "good" | "fair" | "poor";
  advice: string;
}

/**
 * Turns Tesseract's mean confidence into plain advice. The thresholds are
 * deliberately conservative: below ~60 the text usually needs real proofreading.
 */
export function summariseConfidence(confidence: number, charCount: number): ConfidenceSummary {
  const score = Number.isFinite(confidence)
    ? Math.round(Math.min(100, Math.max(0, confidence)))
    : 0;
  if (charCount === 0) {
    return {
      score,
      level: "poor",
      advice:
        "No text was recognised. Check that the image contains printed text, that it is the right way up, and that the right language is selected.",
    };
  }
  if (score >= 85) {
    return {
      score,
      level: "good",
      advice: "Recognition looks clean. Still skim numbers, names and punctuation before relying on them.",
    };
  }
  if (score >= 60) {
    return {
      score,
      level: "fair",
      advice:
        "Mostly readable, with some likely mistakes. Proofread against the image, especially numbers and short words.",
    };
  }
  return {
    score,
    level: "poor",
    advice:
      "Low confidence. A sharper, straighter, better-lit image (or cropping to just the text) usually helps far more than re-running.",
  };
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/u).length;
}
