"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ProgressState } from "@/lib/pdf/contracts";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { loadPdf, PdfOperationError } from "@/lib/pdf/operations/load";
import {
  compressPdf,
  compressPresets,
  percentSaved,
  type CompressPreset,
  type CompressReport,
} from "@/lib/pdf/operations/compress";
import { canvasRecoder } from "@/lib/image/pdf-recoder";
import { fileToBytes, makeResult, revokeResult, type DownloadableResult } from "@/lib/files/download";
import { displayStem, formatBytes } from "@/lib/files/format";

type State =
  | { status: "idle" }
  | { status: "processing"; progress: ProgressState }
  | { status: "done"; report: CompressReport; result: DownloadableResult | null }
  | { status: "error"; error: ToolError };

const presetOrder: CompressPreset[] = ["light", "balanced", "strong"];

export default function CompressPdfTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [preset, setPreset] = useState<CompressPreset>("balanced");
  const [state, setState] = useState<State>({ status: "idle" });

  const clearResult = useCallback(() => {
    setState((prev) => {
      if (prev.status === "done") revokeResult(prev.result);
      return { status: "idle" };
    });
  }, []);

  const reset = useCallback(() => {
    clearResult();
    setDoc(null);
  }, [clearResult]);

  const onFiles = async (incoming: File[]) => {
    const bytes = await fileToBytes(incoming[0]);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 100 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    try {
      const parsed = await loadPdf(bytes);
      setDoc({ name: incoming[0].name, bytes, pageCount: parsed.getPageCount() });
      setState({ status: "idle" });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof PdfOperationError ? err.toolError : toolError("PDF_PARSE_FAILED"),
      });
    }
  };

  const run = async () => {
    if (!doc) return;
    const { maxDimension, quality } = compressPresets[preset];
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Looking for images…" },
    });
    try {
      const { bytes, report } = await compressPdf(doc.bytes, {
        maxDimension,
        quality,
        recoder: canvasRecoder,
        onProgress: (done, total) =>
          setState({
            status: "processing",
            progress: {
              stage: "processing",
              fraction: total === 0 ? null : done / total,
              label: `Re-encoding images (${done} of ${total})…`,
            },
          }),
      });
      const result = report.reduced
        ? makeResult(bytes, `${displayStem(doc.name)}-compressed.pdf`, "application/pdf")
        : null;
      setState({ status: "done", report, result });
    } catch (err) {
      setState({
        status: "error",
        error:
          err instanceof PdfOperationError
            ? err.toolError
            : err instanceof RangeError
              ? toolError("MEMORY_LIMIT_REACHED")
              : toolError("UNKNOWN_PROCESSING_ERROR"),
      });
    }
  };

  if (state.status === "done") {
    const { report, result } = state;
    const saved = percentSaved(report.originalBytes, report.outputBytes);
    return (
      <div>
        <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
          <Stat value={formatBytes(report.originalBytes)} label="Original" />
          <Stat value={formatBytes(report.outputBytes)} label="Compressed" />
          <Stat value={saved > 0 ? `−${saved}%` : "0%"} label="Size saved" highlight />
        </div>
        <p className="mt-3 text-sm text-fg-muted">
          {report.imagesFound === 0
            ? "This PDF contains no images, so there was nothing to re-encode."
            : `Re-encoded ${report.imagesRecompressed} of ${report.imagesFound} ${report.imagesFound === 1 ? "image" : "images"}; the rest were already small enough or are kept as-is for safety. Text and vector graphics were not changed.`}
        </p>
        {result ? (
          <SuccessPanel
            results={[result]}
            note={saved < 10 ? "The saving is small — the images in this file were already well compressed." : undefined}
            onReset={reset}
          />
        ) : (
          <div
            role="status"
            className="mt-6 rounded-(--radius-md) p-4"
            style={{ background: "var(--accent-soft)" }}
          >
            <p className="flex items-center gap-2 font-medium">
              <Info className="h-5 w-5 shrink-0" aria-hidden="true" />
              This PDF could not be made smaller, so no new file was created.
            </p>
            <p className="mt-2 text-sm text-fg-muted">
              {report.imagesFound > 0 && preset !== "strong"
                ? "Your original is already compact for its content. Try the Strong setting, or send fewer pages — extracting just the pages you need always shrinks the file."
                : "Your original is already compact for its content. To get under a size limit, send fewer pages — extracting just the pages you need always shrinks the file."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {report.imagesFound > 0 && preset !== "strong" ? (
                <button
                  type="button"
                  onClick={() => {
                    setPreset("strong");
                    clearResult();
                  }}
                  className="min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
                >
                  Try Strong
                </button>
              ) : null}
              <Link
                href="/tools/extract-pages"
                className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium"
                style={{ borderColor: "var(--glass-strong-border)" }}
              >
                Extract pages instead
              </Link>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 rounded-full border px-4 text-sm font-medium"
                style={{ borderColor: "var(--glass-strong-border)" }}
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {!doc ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          label="Drop a PDF here"
          hint="Images inside the PDF are downscaled and re-encoded on your device."
        />
      ) : (
        <div>
          <p className="break-anywhere text-sm">
            <span className="font-medium">{doc.name}</span>{" "}
            <span className="text-fg-muted">
              · {doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"} · {formatBytes(doc.bytes.length)}
            </span>
          </p>
          <fieldset className="mt-4">
            <legend className="text-sm font-medium">Compression level</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {presetOrder.map((key) => {
                const p = compressPresets[key];
                const checked = preset === key;
                return (
                  <label
                    key={key}
                    className="flex min-h-11 cursor-pointer gap-3 rounded-(--radius-sm) border p-3 focus-within:ring-2 focus-within:ring-accent"
                    style={{
                      borderColor: checked ? "var(--accent)" : "var(--glass-strong-border)",
                      background: checked ? "var(--accent-soft)" : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="compress-preset"
                      value={key}
                      checked={checked}
                      onChange={() => setPreset(key)}
                      className="mt-1 h-4 w-4 shrink-0 accent-(--accent)"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className="block text-xs text-fg-muted">{p.hint}</span>
                      <span className="mt-1 block text-xs text-fg-subtle">
                        Images up to {p.maxDimension}px · JPEG quality {Math.round(p.quality * 100)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={run}
              disabled={state.status === "processing"}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              Compress PDF
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={state.status === "processing"}
              className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted disabled:opacity-40"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              Choose another file
            </button>
          </div>
        </div>
      )}
      {state.status === "processing" ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "error" ? (
        <ErrorPanel error={state.error} onReset={() => (doc ? setState({ status: "idle" }) : reset())} />
      ) : null}
    </div>
  );
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div
      className={highlight ? "rounded-(--radius-sm) p-3 text-center" : "rounded-(--radius-sm) border p-3 text-center"}
      style={highlight ? { background: "var(--success-soft)" } : { borderColor: "var(--glass-strong-border)" }}
    >
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-fg-muted">{label}</p>
    </div>
  );
}
