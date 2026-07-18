"use client";

import { useMemo, useState } from "react";
import { Field, inputClass } from "@/components/tool/Field";
import { computeEmi } from "@/lib/calc/emi";

const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function EmiCalculatorTool() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("11");
  const [years, setYears] = useState("5");

  const result = useMemo(
    () =>
      computeEmi(
        Number.parseFloat(principal) || 0,
        Number.parseFloat(rate) || 0,
        Math.round((Number.parseFloat(years) || 0) * 12),
      ),
    [principal, rate, years],
  );

  return (
    <div>
      <div className="grid max-w-xl gap-4 sm:grid-cols-3">
        <Field label="Loan amount">
          {(id) => <input id={id} type="number" min={1} className={inputClass} value={principal} onChange={(e) => setPrincipal(e.target.value)} />}
        </Field>
        <Field label="Interest rate (% per year)">
          {(id) => <input id={id} type="number" min={0} step={0.1} className={inputClass} value={rate} onChange={(e) => setRate(e.target.value)} />}
        </Field>
        <Field label="Term (years)">
          {(id) => <input id={id} type="number" min={0.5} step={0.5} className={inputClass} value={years} onChange={(e) => setYears(e.target.value)} />}
        </Field>
      </div>
      {result ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
          <div className="rounded-(--radius-md) p-4 text-center" style={{ background: "var(--accent-soft)" }}>
            <p className="text-2xl font-bold">{fmt(result.emi)}</p>
            <p className="mt-1 text-sm text-fg-muted">Monthly payment (EMI)</p>
          </div>
          <div className="rounded-(--radius-md) p-4 text-center" style={{ background: "var(--info-soft)" }}>
            <p className="text-2xl font-bold">{fmt(result.totalInterest)}</p>
            <p className="mt-1 text-sm text-fg-muted">Total interest</p>
          </div>
          <div className="rounded-(--radius-md) p-4 text-center" style={{ background: "var(--warning-soft)" }}>
            <p className="text-2xl font-bold">{fmt(result.totalPayment)}</p>
            <p className="mt-1 text-sm text-fg-muted">Total paid over the term</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-warning" role="alert">Enter a positive amount and term.</p>
      )}
      <p className="mt-3 text-xs text-fg-subtle">
        Standard reducing-balance EMI formula, in your own currency units. This is
        general information, not financial advice — lenders add fees, insurance,
        and rounding rules, so confirm exact figures with your bank.
      </p>
    </div>
  );
}
