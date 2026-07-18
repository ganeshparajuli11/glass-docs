"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy result" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={text.length === 0}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard unavailable — user can select manually.
        }
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg disabled:opacity-40"
      style={{ borderColor: "var(--glass-strong-border)" }}
    >
      {copied ? <Check className="h-4 w-4 text-success" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  );
}
