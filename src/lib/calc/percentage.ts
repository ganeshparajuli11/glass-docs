/** Percentage helpers — pure and testable. */

export function percentOf(percent: number, value: number): number {
  return (percent / 100) * value;
}

export function whatPercent(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return (part / whole) * 100;
}

export function percentChange(from: number, to: number): number | null {
  if (from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}
