"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, selectClass } from "@/components/tool/Field";
import { ErrorPanel } from "@/components/tool/Panels";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { drawToCanvas, encodeCanvas, extensionFor, loadImage, type OutputFormat } from "@/lib/image/process";
import { displayStem } from "@/lib/files/format";
import { makeResult, revokeResult, triggerDownload, type DownloadableResult } from "@/lib/files/download";
import { Download, RotateCcw } from "lucide-react";

const ASPECTS: Array<{ key: string; label: string; ratio: number | null }> = [
  { key: "free", label: "Free", ratio: null },
  { key: "1:1", label: "Square 1:1", ratio: 1 },
  { key: "4:3", label: "4:3", ratio: 4 / 3 },
  { key: "16:9", label: "16:9", ratio: 16 / 9 },
  { key: "3:4", label: "Portrait 3:4", ratio: 3 / 4 },
];

/** Crop region in percent of the source image. */
interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function CropImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [region, setRegion] = useState<Region>({ x: 10, y: 10, w: 80, h: 80 });
  const [aspect, setAspect] = useState("free");
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLImageElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    revokeResult(result);
    setResult(null);
    setError(null);
    setRegion({ x: 10, y: 10, w: 80, h: 80 });
  }, [previewUrl, result]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const onFiles = async (incoming: File[]) => {
    const f = incoming[0];
    const check = validateImageFile(f, { maxRecommendedSizeMb: 25 });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    try {
      const img = await loadImage(f);
      setSize({ w: img.width, h: img.height });
      img.bitmap.close();
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setError(null);
    } catch {
      setError(toolError("FILE_TYPE_UNSUPPORTED"));
    }
  };

  const updateRegion = (patch: Partial<Region>) => {
    setRegion((prev) => {
      let next = { ...prev, ...patch };
      next.w = Math.min(next.w, 100 - next.x);
      next.h = Math.min(next.h, 100 - next.y);
      const a = ASPECTS.find((asp) => asp.key === aspect)?.ratio;
      if (a && size) {
        // Constrain height to match the aspect for the current width.
        const targetHpct = ((next.w / 100) * size.w) / a / size.h * 100;
        next = { ...next, h: Math.min(targetHpct, 100 - next.y) };
      }
      return next;
    });
  };

  const process = async () => {
    if (!file || !size) return;
    setBusy(true);
    try {
      const img = await loadImage(file);
      const crop = {
        x: (region.x / 100) * size.w,
        y: (region.y / 100) * size.h,
        w: Math.max(1, (region.w / 100) * size.w),
        h: Math.max(1, (region.h / 100) * size.h),
      };
      const canvas = drawToCanvas(img.bitmap, crop.w, crop.h, crop);
      img.bitmap.close();
      const blob = await encodeCanvas(canvas, format, 0.92);
      setResult((prev) => {
        revokeResult(prev);
        return makeResult(blob, `${displayStem(file.name)}-cropped.${extensionFor(format)}`, format);
      });
      setError(null);
    } catch {
      setError(toolError("UNKNOWN_PROCESSING_ERROR"));
    } finally {
      setBusy(false);
    }
  };

  const sliders: Array<{ key: keyof Region; label: string; max: number }> = [
    { key: "x", label: "Left offset", max: 99 },
    { key: "y", label: "Top offset", max: 99 },
    { key: "w", label: "Width", max: 100 },
    { key: "h", label: "Height", max: 100 },
  ];

  return (
    <div>
      {!file ? (
        <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop an image here" hint="Choose the crop area with sliders or aspect presets — fully keyboard accessible." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="relative inline-block max-w-full overflow-hidden rounded-(--radius-sm)">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img ref={previewRef} src={previewUrl} alt="Crop preview" className="block max-h-96 max-w-full" />
              ) : null}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute border-2"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.w}%`,
                  height: `${region.h}%`,
                  borderColor: "var(--accent)",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }}
              />
            </div>
            {size ? (
              <p className="mt-2 text-xs text-fg-muted" aria-live="polite">
                Output: {Math.round((region.w / 100) * size.w)} × {Math.round((region.h / 100) * size.h)}px
              </p>
            ) : null}
          </div>
          <div>
            <Field label="Aspect ratio">
              {(id) => (
                <select id={id} className={selectClass} value={aspect} onChange={(e) => { setAspect(e.target.value); updateRegion({}); }}>
                  {ASPECTS.map((a) => (
                    <option key={a.key} value={a.key}>{a.label}</option>
                  ))}
                </select>
              )}
            </Field>
            <div className="mt-3 space-y-3">
              {sliders.map((s) => (
                <div key={s.key}>
                  <label htmlFor={`crop-${s.key}`} className="text-sm">
                    {s.label} ({Math.round(region[s.key])}%)
                  </label>
                  <input
                    id={`crop-${s.key}`}
                    type="range"
                    min={s.key === "w" || s.key === "h" ? 1 : 0}
                    max={s.max}
                    value={region[s.key]}
                    onChange={(e) => updateRegion({ [s.key]: Number(e.target.value) } as Partial<Region>)}
                    className="mt-1 w-full"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 w-40">
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
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={process} className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40">
                {busy ? "Cropping…" : "Crop image"}
              </button>
              <button type="button" disabled={!result} onClick={() => result && triggerDownload(result)} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium disabled:opacity-40" style={{ borderColor: "var(--glass-strong-border)" }}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download
              </button>
              <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted" style={{ borderColor: "var(--glass-strong-border)" }}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
              </button>
            </div>
          </div>
        </div>
      )}
      {error ? <ErrorPanel error={error} onReset={() => setError(null)} /> : null}
    </div>
  );
}
