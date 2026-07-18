/** GPA / grade calculations — pure and testable. Informational, not academic advice. */

export const GRADE_POINTS_4: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, F: 0,
};

export interface Course {
  credits: number;
  gradePoints: number;
}

export function computeGpa(courses: Course[]): { gpa: number; totalCredits: number } {
  const valid = courses.filter((c) => c.credits > 0);
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  if (totalCredits === 0) return { gpa: 0, totalCredits: 0 };
  const points = valid.reduce((s, c) => s + c.credits * c.gradePoints, 0);
  return { gpa: points / totalCredits, totalCredits };
}

export interface WeightedItem {
  /** Weight in percent (e.g. 20 for 20%). */
  weight: number;
  /** Score achieved in percent, or null if not yet taken. */
  score: number | null;
}

/** Current weighted average over completed items (by their weights). */
export function currentWeightedGrade(items: WeightedItem[]): number {
  const done = items.filter((i) => i.score !== null && i.weight > 0);
  const w = done.reduce((s, i) => s + i.weight, 0);
  if (w === 0) return 0;
  return done.reduce((s, i) => s + (i.score as number) * i.weight, 0) / w;
}

/**
 * Score needed (in %) on the remaining weight to reach `target` overall.
 * Returns null if there is no remaining weight.
 */
export function requiredOnRemaining(items: WeightedItem[], target: number): number | null {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const doneWeight = items.filter((i) => i.score !== null).reduce((s, i) => s + i.weight, 0);
  const remaining = totalWeight - doneWeight;
  if (remaining <= 0) return null;
  const earned = items
    .filter((i) => i.score !== null)
    .reduce((s, i) => s + ((i.score as number) / 100) * i.weight, 0);
  const neededPoints = (target / 100) * totalWeight - earned;
  return (neededPoints / remaining) * 100;
}
