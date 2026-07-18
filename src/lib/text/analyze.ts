/** Text statistics — pure and testable. */

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  speakingMinutes: number;
  pagesSingleSpaced: number;
  pagesDoubleSpaced: number;
}

export function analyzeText(text: string): TextStats {
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences =
    trimmed.length === 0 ? 0 : (trimmed.match(/[.!?]+(\s|$)/g) ?? []).length || 1;
  const paragraphs =
    trimmed.length === 0
      ? 0
      : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingMinutes: words / 200,
    speakingMinutes: words / 130,
    pagesSingleSpaced: words / 500,
    pagesDoubleSpaced: words / 250,
  };
}
