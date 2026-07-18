"use client";

import { useState } from "react";
import { inputClass } from "@/components/tool/Field";
import { percentChange, percentOf, whatPercent } from "@/lib/calc/percentage";

function Num({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <span className="inline-flex flex-col">
      <label htmlFor={id} className="text-xs text-fg-muted">{label}</label>
      <input id={id} type="number" className={inputClass + " w-32"} value={value} onChange={(e) => onChange(e.target.value)} />
    </span>
  );
}

const f = (n: number | null) => (n === null || !Number.isFinite(n) ? "—" : (Math.round(n * 100) / 100).toString());

export default function PercentageCalculatorTool() {
  const [p1, setP1] = useState("15");
  const [v1, setV1] = useState("200");
  const [part, setPart] = useState("30");
  const [whole, setWhole] = useState("200");
  const [from, setFrom] = useState("200");
  const [to, setTo] = useState("250");

  const rows = [
    {
      key: "of",
      inputs: (
        <>
          <Num id="p1" value={p1} onChange={setP1} label="Percent" />
          <span className="pb-2.5 text-sm text-fg-muted">% of</span>
          <Num id="v1" value={v1} onChange={setV1} label="Value" />
        </>
      ),
      result: f(percentOf(Number.parseFloat(p1) || 0, Number.parseFloat(v1) || 0)),
    },
    {
      key: "what",
      inputs: (
        <>
          <Num id="part" value={part} onChange={setPart} label="Part" />
          <span className="pb-2.5 text-sm text-fg-muted">as % of</span>
          <Num id="whole" value={whole} onChange={setWhole} label="Whole" />
        </>
      ),
      result: `${f(whatPercent(Number.parseFloat(part) || 0, Number.parseFloat(whole) || 0))}%`,
    },
    {
      key: "change",
      inputs: (
        <>
          <Num id="from" value={from} onChange={setFrom} label="From" />
          <span className="pb-2.5 text-sm text-fg-muted">→</span>
          <Num id="to" value={to} onChange={setTo} label="To" />
        </>
      ),
      result: `${f(percentChange(Number.parseFloat(from) || 0, Number.parseFloat(to) || 0))}%`,
    },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key} className="flex flex-wrap items-end justify-between gap-3 rounded-(--radius-md) border p-4" style={{ borderColor: "var(--glass-strong-border)" }}>
          <div className="flex flex-wrap items-end gap-2">{row.inputs}</div>
          <p className="text-2xl font-bold" aria-live="polite">{row.result}</p>
        </div>
      ))}
      <p className="text-xs text-fg-subtle">
        Three common calculations: X% of a value · a part as a percentage of a whole · percentage change between two values.
      </p>
    </div>
  );
}
