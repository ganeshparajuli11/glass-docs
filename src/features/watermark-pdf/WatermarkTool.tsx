"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, inputClass, selectClass } from "@/components/tool/Field";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { loadPdf, PdfOperationError } from "@/lib/pdf/operations/load";
import { watermarkPdf } from "@/lib/pdf/operations/watermark";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { displayStem } from "@/lib/files/format";

export default function WatermarkTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(45);
  const [position, setPosition] = useState<"center" | "tile">("center");
  const [pagesText, setPagesText] = useState("");
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
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 50 });
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

  const process = async () => {
    if (!doc) return;
    let pages: number[] | undefined;
    if (pagesText.trim().length > 0) {
      const parsed = parsePageRanges(pagesText, doc.pageCount);
      if (!parsed.ok) {
        setState({ status: "error", error: toolError("PAGE_RANGE_INVALID") });
        return;
      }
      pages = parsed.pages;
    }
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Applying watermark…" },
    });
    try {
      const bytes = await watermarkPdf(doc.bytes, {
        text,
        fontSize,
        opacity,
        angle,
        position,
        pages,
      });
      setState({
        status: "success",
        results: [makeResult(bytes, `${displayStem(doc.name)}-watermarked.pdf`, "application/pdf")],
      });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof PdfOperationError ? err.toolError : toolError("UNKNOWN_PROCESSING_ERROR"),
      });
    }
  };

  if (state.status === "success") {
    return <SuccessPanel results={state.results} onReset={reset} />;
  }

  return (
    <div>
      {!doc ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          label="Drop a PDF here"
          hint="Add a text watermark across all or selected pages."
        />
      ) : (
        <div>
          <p className="text-sm">
            <span className="font-medium">{doc.name}</span>{" "}
            <span className="text-fg-muted">· {doc.pageCount} pages</span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Watermark text" hint="Latin characters render best for now.">
              {(id) => (
                <input id={id} className={inputClass} value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
              )}
            </Field>
            <Field label="Font size">
              {(id) => (
                <input id={id} type="number" min={8} max={144} className={inputClass} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
              )}
            </Field>
            <Field label={`Opacity (${Math.round(opacity * 100)}%)`}>
              {(id) => (
                <input id={id} type="range" min={5} max={100} className="mt-3 w-full" value={opacity * 100} onChange={(e) => setOpacity(Number(e.target.value) / 100)} />
              )}
            </Field>
            <Field label="Angle (degrees)">
              {(id) => (
                <input id={id} type="number" min={-90} max={90} className={inputClass} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
              )}
            </Field>
            <Field label="Layout">
              {(id) => (
                <select id={id} className={selectClass} value={position} onChange={(e) => setPosition(e.target.value as "center" | "tile")}>
                  <option value="center">Centered</option>
                  <option value="tile">Tiled pattern</option>
                </select>
              )}
            </Field>
            <Field label="Pages (optional)" hint="Empty = all pages. Example: 1-3, 5">
              {(id) => (
                <input id={id} className={inputClass} value={pagesText} onChange={(e) => setPagesText(e.target.value)} placeholder="All pages" />
              )}
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={process}
              disabled={state.status === "processing" || text.trim().length === 0}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              Add watermark
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
