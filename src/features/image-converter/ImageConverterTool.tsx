"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, selectClass } from "@/components/tool/Field";
import { ErrorPanel } from "@/components/tool/Panels";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { drawToCanvas, encodeCanvas, extensionFor, loadImage, type OutputFormat } from "@/lib/image/process";
import { displayStem, formatBytes } from "@/lib/files/format";
import { makeResult, revokeResult, triggerDownload, type DownloadableResult } from "@/lib/files/download";
import { Download, RotateCcw } from "lucide-react";

export default function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = useCallback(() => {
    setFile(null);
    revokeResult(result);
    setResult(null);
    setError(null);
  }, [result]);

  const onFiles = (incoming: File[]) => {
    const f = incoming[0];
    const check = validateImageFile(f, { maxRecommendedSizeMb: 25 });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(null);
    setFile(f);
    // Default to a different format than the input for convenience.
    if (f.type === "image/png") setFormat("image/jpeg");
    else if (f.type === "image/jpeg") setFormat("image/png");
    else setFormat("image/jpeg");
  };

  const process = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const img = await loadImage(file);
      const canvas = drawToCanvas(img.bitmap, img.width, img.height);
      img.bitmap.close();
      const blob = await encodeCanvas(canvas, format, quality);
      setResult((prev) => {
        revokeResult(prev);
        return makeResult(blob, `${displayStem(file.name)}.${extensionFor(format)}`, format);
      });
    } catch {
      setError(toolError("UNKNOWN_PROCESSING_ERROR"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!file ? (
        <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop an image here" hint="Convert between JPG, PNG, and WebP. Transparency is kept for PNG/WebP output." />
      ) : (
        <div>
          <p className="text-sm text-fg-muted">
            {file.name} · {file.type.replace("image/", "").toUpperCase()} · {formatBytes(file.size)}
          </p>
          <div className="mt-4 grid max-w-lg gap-4 sm:grid-cols-2">
            <Field label="Convert to">
              {(id) => (
                <select id={id} className={selectClass} value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)}>
                  <option value="image/png">PNG (lossless)</option>
                  <option value="image/jpeg">JPG (small, no transparency)</option>
                  <option value="image/webp">WebP (modern)</option>
                </select>
              )}
            </Field>
            {format !== "image/png" ? (
              <Field label={`Quality (${Math.round(quality * 100)}%)`}>
                {(id) => <input id={id} type="range" min={40} max={100} className="mt-3 w-full" value={quality * 100} onChange={(e) => setQuality(Number(e.target.value) / 100)} />}
              </Field>
            ) : null}
          </div>
          {result ? (
            <p className="mt-3 text-sm text-success" aria-live="polite">
              Converted: {result.fileName} ({formatBytes(result.blob.size)})
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={process} className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40">
              {busy ? "Converting…" : "Convert"}
            </button>
            <button type="button" disabled={!result} onClick={() => result && triggerDownload(result)} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium disabled:opacity-40" style={{ borderColor: "var(--glass-strong-border)" }}>
              <Download className="h-4 w-4" aria-hidden="true" /> Download
            </button>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted" style={{ borderColor: "var(--glass-strong-border)" }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
            </button>
          </div>
          <p className="mt-3 text-xs text-fg-subtle">
            Converting JPG onto PNG does not add transparency; converting
            transparent PNG/WebP to JPG fills the background with white.
          </p>
        </div>
      )}
      {error ? <ErrorPanel error={error} onReset={() => setError(null)} /> : null}
    </div>
  );
}
