"use client";

import { useMemo, useState } from "react";
import { Field, textareaClass } from "@/components/tool/Field";
import { analyzeText } from "@/lib/text/analyze";

function fmt(n: number, digits = 1): string {
  return n < 10 ? n.toFixed(digits) : Math.round(n).toString();
}

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyzeText(text), [text]);

  const cards: Array<[string, string]> = [
    ["Words", String(stats.words)],
    ["Characters", String(stats.characters)],
    ["Without spaces", String(stats.charactersNoSpaces)],
    ["Sentences", String(stats.sentences)],
    ["Paragraphs", String(stats.paragraphs)],
    ["Reading time", `${fmt(stats.readingMinutes)} min`],
    ["Speaking time", `${fmt(stats.speakingMinutes)} min`],
    ["Pages (double-spaced)", fmt(stats.pagesDoubleSpaced)],
  ];

  return (
    <div>
      <Field label="Your text" hint="Nothing you type leaves this page.">
        {(id) => (
          <textarea
            id={id}
            className={textareaClass}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text…"
            rows={10}
          />
        )}
      </Field>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-(--radius-sm) border p-3 text-center"
            style={{ borderColor: "var(--glass-strong-border)" }}
          >
            <dd className="text-xl font-bold">{value}</dd>
            <dt className="mt-0.5 text-xs text-fg-muted">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-fg-subtle">
        Reading time assumes 200 words/min; speaking 130 words/min; a
        double-spaced page ≈ 250 words. Real documents vary with formatting.
      </p>
    </div>
  );
}
