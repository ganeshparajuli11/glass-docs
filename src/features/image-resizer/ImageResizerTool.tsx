"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, inputClass, selectClass } from "@/components/tool/Field";
import { ErrorPanel } from "@/components/tool/Panels";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { drawToCanvas, encodeCanvas, extensionFor, loadImage, type OutputFormat } from "@/lib/image/process";
import { displayStem, formatBytes } from "@/lib/files/format";
import { makeResult, revokeResult, triggerDownload, type DownloadableResult } from "@/lib/files/download";
import { Download, RotateCcw } from "lucide-react";

export default function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [orig, setOrig] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = useCallback(() => {
    setFile(null);
    setOrig(null);
    revokeResult(result);
    setResult(null);
    setError(null);
  }, [result]);

  const onFiles = async (incoming: File[]) => {
    const f = incoming[0];
    const check = validateImageFile(f, { maxRecommendedSizeMb: 25 });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    try {
      const img = await loadImage(f);
      setOrig({ w: img.width, h: img.height });
      setWidth(String(img.width));
      setHeight(String(img.height));
      img.bitmap.close();
      setFile(f);
      setError(null);
    } catch {
      setError(toolError("FILE_TYPE_UNSUPPORTED"));
    }
  };

  const setW = (v: string) => {
    setWidth(v);
    if (lockAspect && orig) {
      const w = Number.parseInt(v, 10);
      if (w > 0) setHeight(String(Math.round((w / orig.w) * orig.h)));
    }
  };
  const setH = (v: string) => {
    setHeight(v);
    if (lockAspect && orig) {
      const h = Number.parseInt(v, 10);
      if (h > 0) setWidth(String(Math.round((h / orig.h) * orig.w)));
    }
  };

  const applyPercent = (pct: number) => {
    if (!orig) return;
    setWidth(String(Math.max(1, Math.round((orig.w * pct) / 100))));
    setHeight(String(Math.max(1, Math.round((orig.h * pct) / 100))));
  };

  const process = async () => {
    if (!file) return;
    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);
    if (!(w > 0 && h > 0 && w <= 10000 && h <= 10000)) {
      setError({ code: "UNKNOWN_PROCESSING_ERROR", message: "Enter a width and height between 1 and 10000 pixels." });
      return;
    }
    setBusy(true);
    try {
      const img = await loadImage(file);
      const canvas = drawToCanvas(img.bitmap, w, h);
      img.bitmap.close();
      const blob = await encodeCanvas(canvas, format, 0.92);
      setResult((prev) => {
        revokeResult(prev);
        return makeResult(blob, `${displayStem(file.name)}-${w}x${h}.${extensionFor(format)}`, format);
      });
      setError(null);
    } catch {
      setError(toolError("UNKNOWN_PROCESSING_ERROR"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!file ? (
        <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop an image here" hint="Resize by pixels or percentage, keeping the aspect ratio if you want." />
      ) : (
        <div>
          <p className="text-sm text-fg-muted">
            {file.name} · {orig?.w} × {orig?.h}px · {formatBytes(file.size)}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-28">
              <Field label="Width px">{(id) => <input id={id} type="number" min={1} className={inputClass} value={width} onChange={(e) => setW(e.target.value)} />}</Field>
            </div>
            <div className="w-28">
              <Field label="Height px">{(id) => <input id={id} type="number" min={1} className={inputClass} value={height} onChange={(e) => setH(e.target.value)} />}</Field>
            </div>
            <label className="mb-2.5 flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-(--accent)" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} />
              Lock aspect ratio
            </label>
            <div className="w-40">
              <Field label="Format">
                {(id) => (
                  <select id={id} className={selectClass} value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)}>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                )}
              </Field>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Quick sizes">
            {[75, 50, 25].map((p) => (
              <button key={p} type="button" onClick={() => applyPercent(p)} className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg" style={{ borderColor: "var(--glass-strong-border)" }}>
                {p}%
              </button>
            ))}
          </div>
          {result ? (
            <p className="mt-3 text-sm text-success" aria-live="polite">
              Resized: {result.fileName} ({formatBytes(result.blob.size)})
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={process} className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40">
              {busy ? "Resizing…" : "Resize image"}
            </button>
            <button type="button" disabled={!result} onClick={() => result && triggerDownload(result)} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium disabled:opacity-40" style={{ borderColor: "var(--glass-strong-border)" }}>
              <Download className="h-4 w-4" aria-hidden="true" /> Download
            </button>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted" style={{ borderColor: "var(--glass-strong-border)" }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
            </button>
          </div>
        </div>
      )}
      {error ? <ErrorPanel error={error} onReset={() => setError(null)} /> : null}
    </div>
  );
}
