"use client";

import { useMemo, useState } from "react";
import { Field, selectClass, textareaClass } from "@/components/tool/Field";
import { CopyButton } from "@/components/tool/CopyButton";
import { convertCase, type CaseMode } from "@/lib/text/transform";

const modes: Array<{ key: CaseMode; label: string }> = [
  { key: "upper", label: "UPPERCASE" },
  { key: "lower", label: "lowercase" },
  { key: "title", label: "Title Case" },
  { key: "sentence", label: "Sentence case" },
];

export default function CaseConverterTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("title");
  const result = useMemo(() => convertCase(text, mode), [text, mode]);

  return (
    <div>
      <Field label="Your text">
        {(id) => (
          <textarea id={id} className={textareaClass} value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste text to convert…" />
        )}
      </Field>
      <div className="mt-4 max-w-xs">
        <Field label="Convert to">
          {(id) => (
            <select id={id} className={selectClass} value={mode} onChange={(e) => setMode(e.target.value as CaseMode)}>
              {modes.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field label="Result">
        {(id) => (
          <textarea id={id} readOnly className={textareaClass} value={result} rows={8} />
        )}
      </Field>
      <div className="mt-3">
        <CopyButton text={result} />
      </div>
    </div>
  );
}
