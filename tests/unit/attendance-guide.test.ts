import { describe, expect, it } from "vitest";
import { attendancePercent, classesCanMiss, classesNeeded } from "@/lib/calc/attendance";
import { whatPercent } from "@/lib/calc/percentage";

/**
 * Pins every worked example in /learn/attendance-percentage-classes-you-can-miss
 * to the calculator logic, so the guide cannot silently drift from the tool.
 */
describe("attendance guide worked examples", () => {
  it("26 of 40 is 65% and needs 16 classes to reach 75% (42/56)", () => {
    expect(attendancePercent(26, 40)).toBe(65);
    expect(classesNeeded(26, 40, 75)).toBe(16);
    expect(attendancePercent(42, 56)).toBe(75);
  });

  it("18 of 25 needs 3 / 10 / 22 classes for 75% / 80% / 85%", () => {
    expect(classesNeeded(18, 25, 75)).toBe(3);
    expect(classesNeeded(18, 25, 80)).toBe(10);
    expect(classesNeeded(18, 25, 85)).toBe(22);
  });

  it("one absence from exactly on the line costs r/(1-r) classes", () => {
    // 30/40 = 75%; miss one → 30/41
    expect(classesNeeded(30, 41, 75)).toBe(3);
    // 32/40 = 80%; miss one → 32/41
    expect(classesNeeded(32, 41, 80)).toBe(4);
    // 36/40 = 90%; miss one → 36/41
    expect(classesNeeded(36, 41, 90)).toBe(9);
  });

  it("term allowance table: absences allowed in a 60-class term", () => {
    // Largest m with (60 - m) / 60 >= r, i.e. floor(60 × (1 − r)).
    const termAllowance = (pct: number) => {
      let m = 0;
      while ((60 - (m + 1)) / 60 >= pct / 100 - 1e-9) m += 1;
      return m;
    };
    expect([60, 65, 70, 75, 80, 85, 90].map(termAllowance)).toEqual([24, 21, 18, 15, 12, 9, 6]);
    expect([60, 65, 70, 75, 80, 85, 90].map((p) => Math.floor(60 * (1 - p / 100) + 1e-9))).toEqual([24, 21, 18, 15, 12, 9, 6]);
  });

  it("45 of 52 can miss 8 at 75%; attending 4 more lifts the buffer to 9; missing one drops it to 7", () => {
    expect(classesCanMiss(45, 52, 75)).toBe(8);
    expect(classesCanMiss(49, 56, 75)).toBe(9);
    expect(classesCanMiss(45, 53, 75)).toBe(7);
  });

  it("best possible finish: 46/60 is 76.7%, 36/50 is 72%", () => {
    expect(whatPercent(46, 60)?.toFixed(1)).toBe("76.7");
    expect(whatPercent(36, 50)).toBe(72);
  });

  it("74.5% is treated as below 75%; four more classes reach exactly 75%", () => {
    expect(attendancePercent(149, 200)).toBe(74.5);
    expect(classesNeeded(149, 200, 75)).toBe(4);
    expect(attendancePercent(153, 204)).toBe(75);
  });
});
