/**
 * Loan EMI math — pure and testable.
 * Informational only; not financial advice.
 */

export interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
}

export function computeEmi(
  principal: number,
  annualRatePercent: number,
  months: number,
): EmiResult | null {
  if (principal <= 0 || months <= 0 || annualRatePercent < 0) return null;
  const r = annualRatePercent / 12 / 100;
  if (r === 0) {
    const emi = principal / months;
    return { emi, totalPayment: principal, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, months);
  const emi = (principal * r * factor) / (factor - 1);
  const totalPayment = emi * months;
  return { emi, totalPayment, totalInterest: totalPayment - principal };
}

export interface ScheduleRow {
  /** 1-based payment number. */
  month: number;
  interest: number;
  principal: number;
  /** Amount still owed after this payment. */
  balance: number;
}

/**
 * Month-by-month split of each EMI into interest and principal on a
 * reducing balance. Returns [] for invalid input. Unrounded, like computeEmi.
 */
export function emiSchedule(
  principal: number,
  annualRatePercent: number,
  months: number,
): ScheduleRow[] {
  const result = computeEmi(principal, annualRatePercent, months);
  if (!result || !Number.isInteger(months)) return [];
  const r = annualRatePercent / 12 / 100;
  const rows: ScheduleRow[] = [];
  let balance = principal;
  for (let month = 1; month <= months; month++) {
    const interest = balance * r;
    const repaid = month === months ? balance : result.emi - interest;
    balance = month === months ? 0 : balance - repaid;
    rows.push({ month, interest, principal: repaid, balance });
  }
  return rows;
}

/**
 * How many monthly payments of `payment` clear `principal` (the last one may
 * be smaller), and the interest paid on the way. Null if the payment never
 * covers the monthly interest or the input is invalid.
 */
export function monthsToRepay(
  principal: number,
  annualRatePercent: number,
  payment: number,
): { months: number; totalInterest: number } | null {
  if (principal <= 0 || payment <= 0 || annualRatePercent < 0) return null;
  const r = annualRatePercent / 12 / 100;
  if (payment <= principal * r) return null;
  let balance = principal;
  let months = 0;
  let totalInterest = 0;
  const tolerance = principal * 1e-9;
  while (balance > tolerance && months < 12000) {
    const interest = balance * r;
    totalInterest += interest;
    balance = balance + interest - Math.min(payment, balance + interest);
    months += 1;
  }
  return { months, totalInterest };
}
