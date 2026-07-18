"use client";

import { useMemo, useState } from "react";
import { Field, textareaClass } from "@/components/tool/Field";
import { CopyButton } from "@/components/tool/CopyButton";
import { removeDuplicateLines } from "@/lib/text/transform";

export default function DedupeLinesTool() {
  const [text, setText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [sort, setSort] = useState(false);
  const result = useMemo(
    () => removeDuplicateLines(text, { caseSensitive, sort }),
    [text, caseSensitive, sort],
  );
  const removed =
    text.length === 0 ? 0 : text.split("\n").length - result.split("\n").length;

  return (
    <div>
      <Field label="Lines" hint="One item per line — lists, emails, references…">
        {(id) => (
          <textarea id={id} maxLength={200000} className={textareaClass} value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={"apple\nbanana\napple"} />
        )}
      </Field>
      <div className="mt-3 flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-(--accent)" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-(--accent)" checked={sort} onChange={(e) => setSort(e.target.checked)} />
          Sort alphabetically
        </label>
      </div>
      <Field label="Result">
        {(id) => <textarea id={id} readOnly className={textareaClass} value={result} rows={8} />}
      </Field>
      <div className="mt-3 flex items-center gap-3">
        <CopyButton text={result} />
        {text.length > 0 ? (
          <p className="text-sm text-fg-muted" aria-live="polite">
            {removed} duplicate line{removed === 1 ? "" : "s"} removed.
          </p>
        ) : null}
      </div>
    </div>
  );
}
