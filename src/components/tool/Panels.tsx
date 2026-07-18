"use client";

import { AlertTriangle, CheckCircle2, Download, RotateCcw } from "lucide-react";
import type { ProgressState } from "@/lib/pdf/contracts";
import type { ToolError } from "@/lib/pdf/errors";
import { triggerDownload, type DownloadableResult } from "@/lib/files/download";
import { formatBytes } from "@/lib/files/format";

export function ProgressPanel({
  progress,
  onCancel,
}: {
  progress: ProgressState;
  onCancel?: () => void;
}) {
  const pct = progress.fraction === null ? null : Math.round(progress.fraction * 100);
  return (
    <div role="status" aria-live="polite" className="mt-6">
      <p className="text-sm font-medium">{progress.label}</p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full"
        style={{ background: "var(--accent-soft)" }}
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: pct === null ? "40%" : `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-fg-muted">
        {pct === null ? "Working…" : `${pct}%`}
      </p>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg"
          style={{ borderColor: "var(--glass-strong-border)" }}
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}

export function ErrorPanel({
  error,
  onReset,
}: {
  error: ToolError;
  onReset: () => void;
}) {
  return (
    <div
      role="alert"
      className="mt-6 rounded-(--radius-md) p-4"
      style={{ background: "var(--error-soft)" }}
    >
      <p className="flex items-center gap-2 font-medium text-error">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
        {error.message}
      </p>
      {error.recovery ? (
        <p className="mt-2 text-sm text-fg-muted">{error.recovery}</p>
      ) : null}
      <button
        type="button"
        onClick={onReset}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium"
        style={{ borderColor: "var(--glass-strong-border)" }}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
      </button>
    </div>
  );
}

export function SuccessPanel({
  results,
  note,
  onReset,
}: {
  results: DownloadableResult[];
  note?: string;
  onReset: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 rounded-(--radius-md) p-4"
      style={{ background: "var(--success-soft)" }}
    >
      <p className="flex items-center gap-2 font-medium text-success">
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        Done. {results.length === 1 ? "Your file is ready." : `${results.length} files are ready.`}
      </p>
      {note ? <p className="mt-2 text-sm text-fg-muted">{note}</p> : null}
      <ul className="mt-3 space-y-2">
        {results.map((r) => (
          <li key={r.url} className="flex flex-wrap items-center justify-between gap-2">
            <span className="break-anywhere min-w-0 flex-1 text-sm">
              {r.fileName}{" "}
              <span className="text-fg-subtle">({formatBytes(r.blob.size)})</span>
            </span>
            <button
              type="button"
              onClick={() => triggerDownload(r)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Download
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium"
        style={{ borderColor: "var(--glass-strong-border)" }}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
      </button>
    </div>
  );
}
