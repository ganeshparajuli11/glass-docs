"use client";

import { useMemo, useState } from "react";
import { Field, textareaClass } from "@/components/tool/Field";
import { CopyButton } from "@/components/tool/CopyButton";
import { removeExtraSpaces } from "@/lib/text/transform";

export default function RemoveSpacesTool() {
  const [text, setText] = useState("");
  const result = useMemo(() => removeExtraSpaces(text), [text]);
  const saved = text.length - result.length;

  return (
    <div>
      <Field label="Your text" hint="Collapses repeated spaces/tabs, trims line ends, and reduces runs of blank lines.">
        {(id) => (
          <textarea id={id} className={textareaClass} value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste messy text…" />
        )}
      </Field>
      <Field label="Cleaned result">
        {(id) => <textarea id={id} readOnly className={textareaClass} value={result} rows={8} />}
      </Field>
      <div className="mt-3 flex items-center gap-3">
        <CopyButton text={result} />
        {text.length > 0 ? (
          <p className="text-sm text-fg-muted" aria-live="polite">
            {saved > 0 ? `${saved} characters removed.` : "Already clean."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
