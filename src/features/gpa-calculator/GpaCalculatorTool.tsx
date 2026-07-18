"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { inputClass, selectClass } from "@/components/tool/Field";
import { GRADE_POINTS_4, computeGpa } from "@/lib/calc/gpa";

interface Row {
  id: number;
  name: string;
  credits: string;
  grade: string;
}

let nextId = 1;
const newRow = (): Row => ({ id: nextId++, name: "", credits: "3", grade: "A" });

export default function GpaCalculatorTool() {
  const [rows, setRows] = useState<Row[]>([newRow(), newRow(), newRow()]);

  const result = useMemo(
    () =>
      computeGpa(
        rows.map((r) => ({
          credits: Number.parseFloat(r.credits) || 0,
          gradePoints: GRADE_POINTS_4[r.grade] ?? 0,
        })),
      ),
    [rows],
  );

  const update = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div>
      <div className="space-y-2" role="group" aria-label="Courses">
        {rows.map((row, i) => (
          <div key={row.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <label className="text-xs text-fg-muted" htmlFor={`name-${row.id}`}>
                Course {i + 1} (optional)
              </label>
              <input id={`name-${row.id}`} className={inputClass} value={row.name} onChange={(e) => update(row.id, { name: e.target.value })} placeholder="e.g. Statistics" />
            </div>
            <div className="w-24">
              <label className="text-xs text-fg-muted" htmlFor={`cr-${row.id}`}>
                Credits
              </label>
              <input id={`cr-${row.id}`} type="number" min={0} step={0.5} className={inputClass} value={row.credits} onChange={(e) => update(row.id, { credits: e.target.value })} />
            </div>
            <div className="w-24">
              <label className="text-xs text-fg-muted" htmlFor={`gr-${row.id}`}>
                Grade
              </label>
              <select id={`gr-${row.id}`} className={selectClass} value={row.grade} onChange={(e) => update(row.id, { grade: e.target.value })}>
                {Object.keys(GRADE_POINTS_4).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              aria-label={`Remove course ${i + 1}`}
              disabled={rows.length <= 1}
              onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
              className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-error-soft hover:text-error disabled:opacity-30"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, newRow()])}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg"
        style={{ borderColor: "var(--glass-strong-border)" }}
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Add course
      </button>
      <div
        className="mt-5 rounded-(--radius-md) p-4 text-center"
        style={{ background: "var(--accent-soft)" }}
        aria-live="polite"
      >
        <p className="text-3xl font-bold">{result.gpa.toFixed(2)}</p>
        <p className="mt-1 text-sm text-fg-muted">
          GPA on a 4.0 scale · {result.totalCredits} credits
        </p>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">
        Uses the common 4.0 letter-grade mapping (A/A+ = 4.0, A− = 3.7, B+ = 3.3 …).
        Institutions differ — always confirm with your own grading policy.
      </p>
    </div>
  );
}
