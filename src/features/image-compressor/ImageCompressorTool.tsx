"use client";

import { useCallback, useEffect, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, selectClass } from "@/components/tool/Field";
import { ErrorPanel } from "@/components/tool/Panels";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { drawToCanvas, encodeCanvas, extensionFor, loadImage, type OutputFormat } from "@/lib/image/process";
import { formatBytes, displayStem } from "@/lib/files/format";
import { triggerDownload, makeResult, revokeResult, type DownloadableResult } from "@/lib/files/download";
import { Download, RotateCcw } from "lucide-react";

export default function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = useCallback(() => {
    setFile(null);
    revokeResult(result);
    setResult(null);
    setError(null);
  }, [result]);

  useEffect(() => {
    if (!file) return;
    let stale = false;
    (async () => {
      // Yield first so state updates happen from the async task, not the effect body.
      await Promise.resolve();
      if (stale) return;
      setBusy(true);
      try {
        const img = await loadImage(file);
        const canvas = drawToCanvas(img.bitmap, img.width, img.height);
        img.bitmap.close();
        const blob = await encodeCanvas(canvas, format, quality);
        if (stale) return;
        setResult((prev) => {
          revokeResult(prev);
          return makeResult(blob, `${displayStem(file.name)}-compressed.${extensionFor(format)}`, format);
        });
        setError(null);
      } catch {
        if (!stale) setError(toolError("UNKNOWN_PROCESSING_ERROR"));
      } finally {
        if (!stale) setBusy(false);
      }
    })();
    return () => {
      stale = true;
    };
  }, [file, quality, format]);

  const onFiles = (incoming: File[]) => {
    const f = incoming[0];
    const check = validateImageFile(f, { maxRecommendedSizeMb: 25 });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(null);
    setFile(f);
  };

  const saved = file && result ? Math.max(0, 100 - (result.blob.size / file.size) * 100) : 0;

  return (
    <div>
      {!file ? (
        <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop an image here" hint="JPG, PNG, or WebP. Adjust quality and compare sizes before downloading." />
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Quality (${Math.round(quality * 100)}%)`} hint="Lower = smaller file, more artefacts.">
              {(id) => <input id={id} type="range" min={30} max={95} className="mt-3 w-full" value={quality * 100} onChange={(e) => setQuality(Number(e.target.value) / 100)} />}
            </Field>
            <Field label="Output format">
              {(id) => (
                <select id={id} className={selectClass} value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)}>
                  <option value="image/jpeg">JPEG (photos, smallest)</option>
                  <option value="image/webp">WebP (modern, small)</option>
                </select>
              )}
            </Field>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-live="polite">
            <div className="rounded-(--radius-sm) border p-3 text-center" style={{ borderColor: "var(--glass-strong-border)" }}>
              <p className="text-lg font-bold">{formatBytes(file.size)}</p>
              <p className="text-xs text-fg-muted">Original</p>
            </div>
            <div className="rounded-(--radius-sm) border p-3 text-center" style={{ borderColor: "var(--glass-strong-border)" }}>
              <p className="text-lg font-bold">{busy || !result ? "…" : formatBytes(result.blob.size)}</p>
              <p className="text-xs text-fg-muted">Compressed</p>
            </div>
            <div className="rounded-(--radius-sm) p-3 text-center" style={{ background: "var(--success-soft)" }}>
              <p className="text-lg font-bold">{busy || !result ? "…" : `−${saved.toFixed(0)}%`}</p>
              <p className="text-xs text-fg-muted">Size saved</p>
            </div>
          </div>
          {result ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result.url} alt="Compressed preview" className="mx-auto mt-4 max-h-80 rounded-(--radius-sm)" />
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={!result || busy} onClick={() => result && triggerDownload(result)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40">
              <Download className="h-4 w-4" aria-hidden="true" /> Download
            </button>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted" style={{ borderColor: "var(--glass-strong-border)" }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
            </button>
          </div>
        </div>
      )}
      {error ? <ErrorPanel error={error} onReset={reset} /> : null}
    </div>
  );
}
