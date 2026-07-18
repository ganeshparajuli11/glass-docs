/** Attendance math — pure and testable. */

const EPS = 1e-9;

export function attendancePercent(attended: number, total: number): number {
  if (total <= 0) return 0;
  return (attended / total) * 100;
}

/**
 * Consecutive future classes that must be attended to reach target %.
 * Returns 0 when already at/above target; null if target is unreachable (100% with misses).
 */
export function classesNeeded(attended: number, total: number, targetPercent: number): number | null {
  const t = targetPercent / 100;
  if (t >= 1) return attended === total ? 0 : null;
  if (total > 0 && attended / total >= t - EPS) return 0;
  return Math.max(0, Math.ceil((t * total - attended) / (1 - t) - EPS));
}

/** How many upcoming classes can be missed while staying at/above target %. */
export function classesCanMiss(attended: number, total: number, targetPercent: number): number {
  const t = targetPercent / 100;
  if (t <= 0) return Number.POSITIVE_INFINITY;
  let miss = 0;
  while (attended / (total + miss + 1) >= t - EPS && miss < 10000) miss += 1;
  return miss;
}
