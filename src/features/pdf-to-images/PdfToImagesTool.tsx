"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, selectClass } from "@/components/tool/Field";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { destroyDocument, openDocument, renderPageToCanvas, PdfOpenError } from "@/lib/pdf/pdfjs";
import { fileToBytes, makeResult, revokeResult, type DownloadableResult } from "@/lib/files/download";
import { displayStem } from "@/lib/files/format";

const SCALES = { standard: 1.5, high: 2.5, maximum: 4 } as const;

export default function PdfToImagesTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState<keyof typeof SCALES>("standard");
  const [state, setState] = useState<ToolState>({ status: "idle" });

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "success") prev.results.forEach(revokeResult);
      return { status: "idle" };
    });
    setDoc(null);
  }, []);

  const onFiles = async (incoming: File[]) => {
    const bytes = await fileToBytes(incoming[0]);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 40 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    setDoc({ name: incoming[0].name, bytes });
    setState({ status: "idle" });
  };

  const process = async () => {
    if (!doc) return;
    setState({
      status: "processing",
      progress: { stage: "parsing", fraction: null, label: "Opening PDF…" },
    });
    let pdf: Awaited<ReturnType<typeof openDocument>> | null = null;
    try {
      pdf = await openDocument(doc.bytes);
      const results: DownloadableResult[] = [];
      const stem = displayStem(doc.name);
      const mime = format === "png" ? "image/png" : "image/jpeg";
      for (let p = 1; p <= pdf.numPages; p += 1) {
        setState({
          status: "processing",
          progress: {
            stage: "processing",
            fraction: p / pdf.numPages,
            label: `Rendering page ${p} of ${pdf.numPages}…`,
          },
        });
        const rendered = await renderPageToCanvas(pdf, p, SCALES[quality]);
        const blob = await new Promise<Blob | null>((resolve) =>
          rendered.canvas.toBlob(resolve, mime, format === "jpeg" ? 0.9 : undefined),
        );
        if (!blob) throw new Error("encode failed");
        results.push(makeResult(blob, `${stem}-page-${p}.${format === "png" ? "png" : "jpg"}`, mime));
        rendered.canvas.width = 0; // release backing store eagerly
        rendered.canvas.height = 0;
      }
      setState({
        status: "success",
        results,
        note: "Each page is a separate image file.",
      });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof PdfOpenError ? err.toolError : toolError("UNKNOWN_PROCESSING_ERROR"),
      });
    } finally {
      if (pdf) void destroyDocument(pdf);
    }
  };

  if (state.status === "success") {
    return <SuccessPanel results={state.results} note={state.note} onReset={reset} />;
  }

  return (
    <div>
      {!doc ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          label="Drop a PDF here"
          hint="Every page is exported as a PNG or JPEG image. High resolutions use more memory."
        />
      ) : (
        <div>
          <p className="text-sm font-medium">{doc.name}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Image format">
              {(id) => (
                <select id={id} className={selectClass} value={format} onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}>
                  <option value="png">PNG (lossless)</option>
                  <option value="jpeg">JPEG (smaller files)</option>
                </select>
              )}
            </Field>
            <Field label="Resolution" hint="Higher = sharper but slower and larger.">
              {(id) => (
                <select id={id} className={selectClass} value={quality} onChange={(e) => setQuality(e.target.value as keyof typeof SCALES)}>
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                  <option value="maximum">Maximum</option>
                </select>
              )}
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={process}
              disabled={state.status === "processing"}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              Convert to images
            </button>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              Reset
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
