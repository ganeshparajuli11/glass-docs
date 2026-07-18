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
