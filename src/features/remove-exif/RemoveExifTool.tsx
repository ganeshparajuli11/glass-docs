"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, MapPin, RotateCcw, ShieldAlert, ShieldCheck } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { formatBytes } from "@/lib/files/format";
import { makeResult, revokeResult, triggerDownload, type DownloadableResult } from "@/lib/files/download";
import {
  cleanFileName,
  cleanImageMetadata,
  describeFindings,
  MetadataError,
  type Finding,
} from "@/lib/image/metadata";

const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const MAX_FILES = 20;
const border = { borderColor: "var(--glass-strong-border)" } as const;

interface Item {
  id: number;
  name: string;
  originalSize: number;
  findings: Finding[];
  changed: boolean;
  keptOrientation: number | null;
  result: DownloadableResult | null;
  error: string | null;
}

function errorMessage(err: unknown): string {
  if (err instanceof MetadataError) {
    if (err.reason === "heic") {
      return "HEIC/HEIF photos are not supported yet. Save or share the photo as JPEG first, then clean the JPEG here.";
    }
    if (err.reason === "unsupported") return "This is not a JPEG, PNG or WebP image, so it was skipped.";
    return "This image looks damaged or cut short, so it was left alone rather than risk breaking it.";
  }
  return "The file could not be read. Try saving it again and adding it once more.";
}

async function processFile(file: File, id: number, keepOrientation: boolean): Promise<Item> {
  const base = { id, name: file.name, originalSize: file.size };
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const cleaned = cleanImageMetadata(bytes, { keepOrientation });
    const mime = `image/${cleaned.report.kind}`;
    return {
      ...base,
      findings: describeFindings(cleaned.report),
      changed: cleaned.changed,
      keptOrientation: cleaned.keptOrientation,
      result: makeResult(cleaned.bytes, cleanFileName(file.name, cleaned.report.kind), mime),
      error: null,
    };
  } catch (err) {
    return { ...base, findings: [], changed: false, keptOrientation: null, result: null, error: errorMessage(err) };
  }
}

export default function RemoveExifTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [keepOrientation, setKeepOrientation] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef<Item[]>([]);

  // Free every object URL when the page is left.
  useEffect(() => () => itemsRef.current.forEach((i) => revokeResult(i.result)), []);

  useEffect(() => {
    let stale = false;
    (async () => {
      await Promise.resolve();
      if (stale) return;
      if (files.length === 0) {
        itemsRef.current.forEach((i) => revokeResult(i.result));
        itemsRef.current = [];
        setItems([]);
        return;
      }
      setBusy(true);
      const next: Item[] = [];
      for (let i = 0; i < files.length; i += 1) {
        next.push(await processFile(files[i], i, keepOrientation));
        if (stale) break;
      }
      if (stale) {
        next.forEach((i) => revokeResult(i.result));
        return;
      }
      itemsRef.current.forEach((i) => revokeResult(i.result));
      itemsRef.current = next;
      setItems(next);
      setBusy(false);
    })();
    return () => {
      stale = true;
    };
  }, [files, keepOrientation]);

  const onFiles = useCallback(
    (incoming: File[]) => {
      const all = [...files, ...incoming];
      setNotice(all.length > MAX_FILES ? `Only the first ${MAX_FILES} photos are cleaned at a time.` : null);
      setFiles(all.slice(0, MAX_FILES));
    },
    [files],
  );

  const reset = () => {
    setFiles([]);
    setNotice(null);
  };

  const done = items.filter((i) => i.result);
  const withGps = items.filter((i) => i.findings.some((f) => f.label === "GPS location")).length;
  const cleanedCount = items.filter((i) => i.changed).length;

  const downloadAll = async () => {
    for (const item of done) {
      if (!item.result || !item.changed) continue;
      triggerDownload(item.result);
      // Browsers drop rapid-fire downloads; space them out a little.
      await new Promise((r) => setTimeout(r, 350));
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-(--accent)"
            checked={keepOrientation}
            onChange={(e) => setKeepOrientation(e.target.checked)}
          />
          <span>
            <span className="font-medium">Keep the rotation flag</span>
            <span className="block text-xs text-fg-muted">
              Recommended. Phones often store photos sideways with a tag saying how to turn them; keeping
              that one tag (and nothing else) stops cleaned photos appearing rotated.
            </span>
          </span>
        </label>
      </div>

      <FileDrop
        accept={ACCEPT}
        multiple
        onFiles={onFiles}
        label={files.length === 0 ? "Drop photos here" : "Add more photos"}
        hint={`JPG, PNG or WebP, up to ${MAX_FILES} at a time. You will see what each photo contains before you download.`}
        disabled={busy}
      />

      {notice ? <p className="mt-3 text-sm text-fg-muted" role="status">{notice}</p> : null}
      {busy ? (
        <p role="status" className="mt-4 text-sm text-fg-muted">
          Reading metadata…
        </p>
      ) : null}

      {items.length > 0 && !busy ? (
        <div className="mt-6">
          <div role="status" aria-live="polite" className="rounded-(--radius-md) p-4" style={{ background: "var(--success-soft)" }}>
            <p className="flex items-start gap-2 font-medium text-success">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                {cleanedCount === 0
                  ? "No hidden metadata found — nothing needed removing."
                  : `Metadata removed from ${cleanedCount} of ${items.length} ${items.length === 1 ? "photo" : "photos"}.`}
                {withGps > 0 ? ` ${withGps} ${withGps === 1 ? "photo contained" : "photos contained"} a GPS location.` : ""}
              </span>
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              The picture data was copied unchanged, so quality is identical to your original.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {done.filter((i) => i.changed).length > 1 ? (
                <button
                  type="button"
                  onClick={() => void downloadAll()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Download all ({done.filter((i) => i.changed).length})
                </button>
              ) : null}
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium"
                style={border}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
              </button>
            </div>
          </div>

          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-(--radius-md) border p-4" style={border}>
                <div className="flex flex-wrap items-start gap-4">
                  {item.result ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.result.url}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-(--radius-sm) object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <h3 className="break-anywhere text-sm font-semibold">{item.name}</h3>
                    {item.error ? (
                      <p className="mt-1 flex items-start gap-2 text-sm text-error">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {item.error}
                      </p>
                    ) : item.result ? (
                      <p className="mt-1 text-xs text-fg-muted">
                        {formatBytes(item.originalSize)} → {formatBytes(item.result.blob.size)}
                        {item.keptOrientation !== null ? " · rotation flag kept" : ""}
                      </p>
                    ) : null}
                  </div>
                  {item.result && item.changed ? (
                    <button
                      type="button"
                      onClick={() => item.result && triggerDownload(item.result)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" /> Download
                      <span className="sr-only"> cleaned {item.name}</span>
                    </button>
                  ) : null}
                </div>

                {item.result && !item.changed ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-fg-muted">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    Already clean — this file carries no metadata, so your original is safe to share as it is.
                  </p>
                ) : null}

                {item.findings.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Found and removed</p>
                    <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-[minmax(0,12rem)_1fr]">
                      {item.findings.map((f) => (
                        <div key={f.label} className="contents">
                          <dt className="flex items-center gap-1.5 font-medium">
                            {f.sensitive ? (
                              <>
                                {f.label === "GPS location" ? (
                                  <MapPin className="h-4 w-4 shrink-0 text-error" aria-hidden="true" />
                                ) : (
                                  <ShieldAlert className="h-4 w-4 shrink-0 text-error" aria-hidden="true" />
                                )}
                                <span className="sr-only">Private: </span>
                              </>
                            ) : null}
                            {f.label}
                          </dt>
                          <dd className="break-anywhere text-fg-muted">{f.detail}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
