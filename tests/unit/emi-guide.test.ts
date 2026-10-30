import { describe, expect, it } from "vitest";
import { computeEmi, emiSchedule, monthsToRepay } from "@/lib/calc/emi";

const money = (n: number) => n.toFixed(2);

describe("emiSchedule and monthsToRepay", () => {
  it("schedule rows add up to the loan and the EMI", () => {
    const rows = emiSchedule(100000, 12, 12);
    const emi = computeEmi(100000, 12, 12)!.emi;
    expect(rows).toHaveLength(12);
    expect(rows.at(-1)!.balance).toBe(0);
    expect(rows.reduce((s, r) => s + r.principal, 0)).toBeCloseTo(100000, 6);
    for (const r of rows) expect(r.interest + r.principal).toBeCloseTo(emi, 6);
  });

  it("schedule handles 0% and rejects bad input", () => {
    const rows = emiSchedule(1200, 0, 12);
    expect(rows.every((r) => r.interest === 0 && Math.abs(r.principal - 100) < 1e-9)).toBe(true);
    expect(emiSchedule(0, 10, 12)).toEqual([]);
    expect(emiSchedule(1000, 10, 0)).toEqual([]);
    expect(emiSchedule(1000, 10, 6.5)).toEqual([]);
  });

  it("monthsToRepay matches the EMI term and refuses payments below the interest", () => {
    const { emi } = computeEmi(500000, 11, 60)!;
    const r = monthsToRepay(500000, 11, emi)!;
    expect(r.months).toBe(60);
    expect(r.totalInterest).toBeCloseTo(computeEmi(500000, 11, 60)!.totalInterest, 4);
    expect(monthsToRepay(500000, 12, 5000)).toBeNull(); // interest alone is 5,000
    expect(monthsToRepay(1200, 0, 100)).toEqual({ months: 12, totalInterest: 0 });
    expect(monthsToRepay(0, 10, 100)).toBeNull();
  });
});

/**
 * Pins every worked figure in /learn/loan-emi-calculation-compare-loans to the
 * calculator logic, so the guide cannot drift from the tool.
 */
describe("EMI guide worked examples", () => {
  it("500,000 at 11% over 5 years", () => {
    const r = computeEmi(500000, 11, 60)!;
    expect(money(r.emi)).toBe("10871.21");
    expect(money(r.totalInterest)).toBe("152272.69");
    expect(money(r.totalPayment)).toBe("652272.69");
  });

  it("first payment split and balance", () => {
    const [m1] = emiSchedule(500000, 11, 60);
    expect(money(m1.interest)).toBe("4583.33");
    expect(money(m1.principal)).toBe("6287.88");
    expect(money(m1.balance)).toBe("493712.12");
  });

  it("3,000,000 at 9% over 20 years: interest-heavy early years", () => {
    const r = computeEmi(3000000, 9, 240)!;
    expect(money(r.emi)).toBe("26991.78");
    expect(money(r.totalInterest)).toBe("3478026.88");
    const rows = emiSchedule(3000000, 9, 240);
    expect(money(rows[0].interest)).toBe("22500.00");
    expect(money(rows[0].principal)).toBe("4491.78");
    const year1 = rows.slice(0, 12);
    expect(Math.round(year1.reduce((s, x) => s + x.interest, 0))).toBe(267720);
    expect(Math.round(year1.reduce((s, x) => s + x.principal, 0))).toBe(56181);
    expect(rows.findIndex((x) => x.principal > x.interest) + 1).toBe(149);
    expect(Math.round(rows[119].balance)).toBe(2130777);
    expect(Math.round((rows[119].balance / 3000000) * 100)).toBe(71);
  });

  it("term table for 500,000 at 11%", () => {
    const t = [3, 5, 7, 10].map((y) => {
      const r = computeEmi(500000, 11, y * 12)!;
      return [Math.round(r.emi), Math.round(r.totalInterest)];
    });
    expect(t).toEqual([
      [16369, 89297],
      [10871, 152273],
      [8561, 219142],
      [6888, 326500],
    ]);
  });

  it("term table for 3,000,000 at 9%", () => {
    const t = [15, 20, 25, 30].map((y) => {
      const r = computeEmi(3000000, 9, y * 12)!;
      return [Math.round(r.emi), Math.round(r.totalInterest)];
    });
    expect(t).toEqual([
      [30428, 2477040],
      [26992, 3478027],
      [25176, 4552767],
      [24139, 5689924],
    ]);
  });

  it("one percentage point on 500,000 over 5 years", () => {
    const t = [10, 11, 12].map((p) => {
      const r = computeEmi(500000, p, 60)!;
      return [Math.round(r.emi), Math.round(r.totalInterest)];
    });
    expect(t).toEqual([
      [10624, 137411],
      [10871, 152273],
      [11122, 167333],
    ]);
  });

  it("11% flat on 500,000 for 5 years is about 18.8% reducing", () => {
    const flatInterest = 500000 * 0.11 * 5;
    expect(flatInterest).toBe(275000);
    const flatEmi = (500000 + flatInterest) / 60;
    expect(money(flatEmi)).toBe("12916.67");
    // The calculator at 18.8% gives (almost exactly) the same monthly payment.
    expect(money(computeEmi(500000, 18.8, 60)!.emi)).toBe("12915.31");
    expect(computeEmi(500000, 18.7, 60)!.emi).toBeLessThan(flatEmi);
    expect(computeEmi(500000, 18.9, 60)!.emi).toBeGreaterThan(flatEmi);
  });

  it("prepaying 100,000 after a year", () => {
    const rows = emiSchedule(500000, 11, 60);
    const bal = rows[11].balance;
    expect(money(bal)).toBe("420622.62");
    const remainingInterest = rows.slice(12).reduce((s, x) => s + x.interest, 0);
    expect(Math.round(remainingInterest)).toBe(101196);

    const after = bal - 100000;
    const keepTerm = computeEmi(after, 11, 48)!;
    expect(money(keepTerm.emi)).toBe("8286.66");
    expect(Math.round(keepTerm.totalInterest)).toBe(77137);

    const keepEmi = monthsToRepay(after, 11, computeEmi(500000, 11, 60)!.emi)!;
    expect(keepEmi.months).toBe(35);
    expect(Math.round(keepEmi.totalInterest)).toBe(54902);

    expect(Math.round(remainingInterest - keepTerm.totalInterest)).toBe(24059);
    expect(Math.round(remainingInterest - keepEmi.totalInterest)).toBe(46294);
  });
});

describe("EMI guide flat-rate rule of thumb", () => {
  it("flat 6–20% over 1–7 years is about 1.5–1.85× as a reducing rate", () => {
    const equivalent = (flat: number, years: number) => {
      const target = (1 + (flat / 100) * years) / (years * 12);
      let lo = 0;
      let hi = 200;
      for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        if (computeEmi(1, mid, years * 12)!.emi < target) lo = mid;
        else hi = mid;
      }
      return lo;
    };
    for (const flat of [6, 8, 11, 15, 20]) {
      for (const years of [1, 2, 3, 5, 7]) {
        const k = equivalent(flat, years) / flat;
        expect(k).toBeGreaterThanOrEqual(1.49);
        expect(k).toBeLessThanOrEqual(1.86);
      }
    }
    expect(equivalent(11, 5)).toBeCloseTo(18.8, 1);
  });

  it("using the annual rate as the monthly rate gives an EMI above 55,000", () => {
    const r = 0.11;
    const f = Math.pow(1 + r, 60);
    expect((500000 * r * f) / (f - 1)).toBeGreaterThan(55000);
  });
});

describe("EMI guide intro claim", () => {
  it("25 vs 30 years on 3,000,000 at 9%: EMIs ~4% apart, interest gap > a third of the loan", () => {
    const a = computeEmi(3000000, 9, 300)!;
    const b = computeEmi(3000000, 9, 360)!;
    expect(a.emi / b.emi).toBeLessThan(1.05);
    expect(b.totalPayment - a.totalPayment).toBeGreaterThan(3000000 / 3);
    expect(Math.round(a.emi - b.emi)).toBe(1037);
    expect(b.totalInterest - a.totalInterest).toBeGreaterThan(1100000);
  });
});
