"use client";

import { useMemo, useState } from "react";
import { Field, textareaClass } from "@/components/tool/Field";
import { diffLines, similarityPercent, DIFF_MAX_LINES } from "@/lib/text/diff";

export default function TextCompareTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const diff = useMemo(() => (a || b ? diffLines(a, b) : []), [a, b]);
  const similarity = useMemo(() => similarityPercent(diff), [diff]);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Original text">
          {(id) => <textarea id={id} maxLength={200000} className={textareaClass} value={a} onChange={(e) => setA(e.target.value)} rows={10} />}
        </Field>
        <Field label="Changed text">
          {(id) => <textarea id={id} maxLength={200000} className={textareaClass} value={b} onChange={(e) => setB(e.target.value)} rows={10} />}
        </Field>
      </div>
      {diff.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-medium" aria-live="polite">
            Similarity: {similarity}% ({diff.filter((d) => d.type !== "same").length} changed lines)
          </p>
          <div
            className="mt-2 max-h-96 overflow-auto rounded-(--radius-sm) border p-2 font-mono text-sm"
            style={{ borderColor: "var(--glass-strong-border)" }}
          >
            {diff.map((line, i) => (
              <div
                key={i}
                className="whitespace-pre-wrap break-anywhere px-2"
                style={{
                  background:
                    line.type === "added"
                      ? "var(--success-soft)"
                      : line.type === "removed"
                        ? "var(--error-soft)"
                        : undefined,
                }}
              >
                <span className="mr-2 select-none text-fg-subtle">
                  {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                </span>
                {line.text || " "}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-subtle">
            Line-by-line comparison, up to {DIFF_MAX_LINES} lines per side. Green = added, red = removed.
          </p>
        </div>
      ) : null}
    </div>
  );
}
