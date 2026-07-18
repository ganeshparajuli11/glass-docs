/** Line diff via LCS — bounded inputs (browser tool). */

export interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
}

export const DIFF_MAX_LINES = 3000;

export function diffLines(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n").slice(0, DIFF_MAX_LINES);
  const bLines = b.split("\n").slice(0, DIFF_MAX_LINES);
  const n = aLines.length;
  const m = bLines.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] =
        aLines[i] === bLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aLines[i] === bLines[j]) {
      out.push({ type: "same", text: aLines[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "removed", text: aLines[i] });
      i += 1;
    } else {
      out.push({ type: "added", text: bLines[j] });
      j += 1;
    }
  }
  while (i < n) out.push({ type: "removed", text: aLines[i++] });
  while (j < m) out.push({ type: "added", text: bLines[j++] });
  return out;
}

export function similarityPercent(diff: DiffLine[]): number {
  const total = diff.length;
  if (total === 0) return 100;
  const same = diff.filter((d) => d.type === "same").length;
  return Math.round((same / total) * 100);
}
