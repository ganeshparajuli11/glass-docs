"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { inputClass } from "@/components/tool/Field";
import { currentWeightedGrade, requiredOnRemaining } from "@/lib/calc/gpa";

interface Row {
  id: number;
  name: string;
  weight: string;
  score: string;
}

let nextId = 1;
const newRow = (name = "", weight = "", score = ""): Row => ({ id: nextId++, name, weight, score });

export default function GradeCalculatorTool() {
  const [rows, setRows] = useState<Row[]>([
    newRow("Coursework", "40", "68"),
    newRow("Final exam", "60", ""),
  ]);
  const [target, setTarget] = useState("70");

  const items = useMemo(
    () =>
      rows.map((r) => ({
        weight: Number.parseFloat(r.weight) || 0,
        score: r.score.trim() === "" ? null : Number.parseFloat(r.score) || 0,
      })),
    [rows],
  );
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const current = useMemo(() => currentWeightedGrade(items), [items]);
  const needed = useMemo(
    () => requiredOnRemaining(items, Number.parseFloat(target) || 0),
    [items, target],
  );

  const update = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div>
      <div className="space-y-2" role="group" aria-label="Assessments">
        {rows.map((row, i) => (
          <div key={row.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <label className="text-xs text-fg-muted" htmlFor={`n-${row.id}`}>Assessment {i + 1}</label>
              <input id={`n-${row.id}`} className={inputClass} value={row.name} onChange={(e) => update(row.id, { name: e.target.value })} placeholder="e.g. Essay" />
            </div>
            <div className="w-28">
              <label className="text-xs text-fg-muted" htmlFor={`w-${row.id}`}>Weight %</label>
              <input id={`w-${row.id}`} type="number" min={0} max={100} className={inputClass} value={row.weight} onChange={(e) => update(row.id, { weight: e.target.value })} />
            </div>
            <div className="w-28">
              <label className="text-xs text-fg-muted" htmlFor={`s-${row.id}`}>Score % (empty = not yet)</label>
              <input id={`s-${row.id}`} type="number" min={0} max={100} className={inputClass} value={row.score} onChange={(e) => update(row.id, { score: e.target.value })} />
            </div>
            <button type="button" aria-label={`Remove assessment ${i + 1}`} disabled={rows.length <= 1} onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))} className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-error-soft hover:text-error disabled:opacity-30">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <button type="button" onClick={() => setRows((prev) => [...prev, newRow()])} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg" style={{ borderColor: "var(--glass-strong-border)" }}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add assessment
        </button>
        <div className="w-32">
          <label className="text-xs text-fg-muted" htmlFor="target">Target overall %</label>
          <input id="target" type="number" min={0} max={100} className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
      </div>
      {totalWeight !== 100 ? (
        <p className="mt-2 text-sm text-warning" role="alert">
          Weights add up to {totalWeight}% — results assume that is the full module.
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-(--radius-md) p-4 text-center" style={{ background: "var(--accent-soft)" }}>
          <p className="text-3xl font-bold">{current.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-fg-muted">Current weighted average</p>
        </div>
        <div className="rounded-(--radius-md) p-4 text-center" style={{ background: needed !== null && needed > 100 ? "var(--error-soft)" : "var(--success-soft)" }}>
          <p className="text-3xl font-bold">
            {needed === null ? "—" : `${Math.max(0, needed).toFixed(1)}%`}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {needed === null
              ? "Nothing remaining"
              : needed > 100
                ? "Needed on remaining work (above 100% — target not reachable)"
                : "Needed on remaining work to hit target"}
          </p>
        </div>
      </div>
    </div>
  );
}
