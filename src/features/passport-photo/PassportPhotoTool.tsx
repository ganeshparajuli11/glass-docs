"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, selectClass } from "@/components/tool/Field";
import { ErrorPanel } from "@/components/tool/Panels";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { loadImage } from "@/lib/image/process";
import {
  GAP_MM,
  MARGIN_MM,
  MM_TO_PX_300DPI,
  PHOTO_PRESETS,
  SHEET_PRESETS,
  layoutSheet,
} from "@/lib/image/passport";
import { displayStem } from "@/lib/files/format";
import { makeResult, revokeResult, triggerDownload, type DownloadableResult } from "@/lib/files/download";
import { Download, RotateCcw } from "lucide-react";

export default function PassportPhotoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [photoKey, setPhotoKey] = useState("35x45");
  const [sheetKey, setSheetKey] = useState("4x6");
  const [result, setResult] = useState<DownloadableResult | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);

  const photo = PHOTO_PRESETS.find((p) => p.key === photoKey)!;
  const sheet = SHEET_PRESETS.find((s) => s.key === sheetKey)!;
  const layout = layoutSheet(photo, sheet);

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
    revokeResult(result);
    setResult(null);
  };

  const process = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const img = await loadImage(file);
      const px = MM_TO_PX_300DPI;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sheet.widthMm * px);
      canvas.height = Math.round(sheet.heightMm * px);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";

      // Cover-crop the photo to the passport aspect ratio (centre crop).
      const targetRatio = photo.widthMm / photo.heightMm;
      const srcRatio = img.width / img.height;
      let sx = 0;
      let sy = 0;
      let sw = img.width;
      let sh = img.height;
      if (srcRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      const wPx = photo.widthMm * px;
      const hPx = photo.heightMm * px;
      ctx.strokeStyle = "#c8c8c8";
      ctx.lineWidth = 1;
      for (const pos of layout.positions) {
        const x = pos.x * px;
        const y = pos.y * px;
        ctx.drawImage(img.bitmap, sx, sy, sw, sh, x, y, wPx, hPx);
        ctx.strokeRect(x + 0.5, y + 0.5, wPx - 1, hPx - 1); // cutting guides
      }
      img.bitmap.close();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95),
      );
      if (!blob) throw new Error("encode failed");
      setResult((prev) => {
        revokeResult(prev);
        return makeResult(blob, `${displayStem(file.name)}-sheet-${sheet.key}.jpg`, "image/jpeg");
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
        <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={onFiles} label="Drop your photo here" hint="Use a well-lit, front-facing photo. The tool centre-crops it to the passport ratio and tiles a print sheet." />
      ) : (
        <div>
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <Field label="Photo size">
              {(id) => (
                <select id={id} className={selectClass} value={photoKey} onChange={(e) => setPhotoKey(e.target.value)}>
                  {PHOTO_PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Print sheet">
              {(id) => (
                <select id={id} className={selectClass} value={sheetKey} onChange={(e) => setSheetKey(e.target.value)}>
                  {SHEET_PRESETS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <p className="mt-3 text-sm text-fg-muted" aria-live="polite">
            {layout.count} photos per sheet ({layout.cols} × {layout.rows}), {MARGIN_MM}mm margin, {GAP_MM}mm gaps, 300 DPI with cutting guides.
          </p>
          {result ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result.url} alt="Passport sheet preview" className="mt-4 max-h-96 rounded-(--radius-sm) border" style={{ borderColor: "var(--glass-strong-border)" }} />
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy || layout.count === 0} onClick={process} className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40">
              {busy ? "Building sheet…" : "Create sheet"}
            </button>
            <button type="button" disabled={!result} onClick={() => result && triggerDownload(result)} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium disabled:opacity-40" style={{ borderColor: "var(--glass-strong-border)" }}>
              <Download className="h-4 w-4" aria-hidden="true" /> Download JPG
            </button>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted" style={{ borderColor: "var(--glass-strong-border)" }}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
            </button>
          </div>
          <p className="mt-3 text-xs text-fg-subtle">
            Print at 100% scale (no “fit to page”). Official photo rules (head size,
            background, expression) are your responsibility — this tool only handles
            sizing and layout.
          </p>
        </div>
      )}
      {error ? <ErrorPanel error={error} onReset={() => setError(null)} /> : null}
    </div>
  );
}
