/** Text transformations — pure and testable. */

export type CaseMode = "upper" | "lower" | "title" | "sentence";

export function convertCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text
        .toLowerCase()
        .replace(/(^|[\s\-(["'])(\p{L})/gu, (m, pre: string, ch: string) => pre + ch.toUpperCase());
    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gu, (m) => m.toUpperCase());
  }
}

/** Collapses runs of spaces/tabs, trims line ends, collapses 3+ blank lines. */
export function removeExtraSpaces(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface DedupeOptions {
  caseSensitive: boolean;
  sort: boolean;
}

export function removeDuplicateLines(text: string, opts: DedupeOptions): string {
  const lines = text.split("\n");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = opts.caseSensitive ? line : line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  if (opts.sort) out.sort((a, b) => a.localeCompare(b));
  return out.join("\n");
}
