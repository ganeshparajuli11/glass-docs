"use client";

import { useMemo, useState } from "react";
import { Field, inputClass } from "@/components/tool/Field";
import { attendancePercent, classesCanMiss, classesNeeded } from "@/lib/calc/attendance";

export default function AttendanceCalculatorTool() {
  const [attended, setAttended] = useState("18");
  const [total, setTotal] = useState("24");
  const [target, setTarget] = useState("75");

  const a = Number.parseInt(attended, 10) || 0;
  const t = Number.parseInt(total, 10) || 0;
  const tgt = Number.parseFloat(target) || 0;

  const valid = t > 0 && a >= 0 && a <= t && tgt > 0 && tgt <= 100;
  const percent = useMemo(() => attendancePercent(a, t), [a, t]);
  const needed = useMemo(() => (valid ? classesNeeded(a, t, tgt) : null), [a, t, tgt, valid]);
  const canMiss = useMemo(() => (valid ? classesCanMiss(a, t, tgt) : 0), [a, t, tgt, valid]);

  return (
    <div>
      <div className="grid max-w-xl gap-4 sm:grid-cols-3">
        <Field label="Classes attended">
          {(id) => <input id={id} type="number" min={0} className={inputClass} value={attended} onChange={(e) => setAttended(e.target.value)} />}
        </Field>
        <Field label="Classes held">
          {(id) => <input id={id} type="number" min={1} className={inputClass} value={total} onChange={(e) => setTotal(e.target.value)} />}
        </Field>
        <Field label="Required %">
          {(id) => <input id={id} type="number" min={1} max={100} className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)} />}
        </Field>
      </div>
      {!valid ? (
        <p className="mt-3 text-sm text-warning" role="alert">
          Check the numbers — attended can’t exceed classes held.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
          <div className="rounded-(--radius-md) p-4 text-center" style={{ background: "var(--accent-soft)" }}>
            <p className="text-3xl font-bold">{percent.toFixed(1)}%</p>
            <p className="mt-1 text-sm text-fg-muted">Current attendance</p>
          </div>
          <div className="rounded-(--radius-md) p-4 text-center" style={{ background: percent >= tgt ? "var(--success-soft)" : "var(--warning-soft)" }}>
            <p className="text-3xl font-bold">{needed === null ? "—" : needed}</p>
            <p className="mt-1 text-sm text-fg-muted">
              {needed === 0 ? "Classes needed (target already met)" : "Consecutive classes needed to reach target"}
            </p>
          </div>
          <div className="rounded-(--radius-md) p-4 text-center" style={{ background: "var(--info-soft)" }}>
            <p className="text-3xl font-bold">{Number.isFinite(canMiss) ? canMiss : "∞"}</p>
            <p className="mt-1 text-sm text-fg-muted">Upcoming classes you could miss and stay at target</p>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-fg-subtle">
        Simple projection assuming one class at a time. Check your institution’s own attendance rules.
      </p>
    </div>
  );
}
