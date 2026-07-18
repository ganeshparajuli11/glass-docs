"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, inputClass, selectClass } from "@/components/tool/Field";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { loadPdf, PdfOperationError } from "@/lib/pdf/operations/load";
import { addPageNumbers } from "@/lib/pdf/operations/page-numbers";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { displayStem } from "@/lib/files/format";

export default function PageNumbersTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");
  const [startNumber, setStartNumber] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [skipFirst, setSkipFirst] = useState(0);
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
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Adding page numbers…" },
    });
    try {
      const bytes = await addPageNumbers(doc.bytes, {
        position,
        alignment,
        startNumber,
        prefix,
        suffix,
        skipFirst,
        fontSize: 11,
      });
      setState({
        status: "success",
        results: [makeResult(bytes, `${displayStem(doc.name)}-numbered.pdf`, "application/pdf")],
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
          hint="Number the pages with a position and format you choose."
        />
      ) : (
        <div>
          <p className="text-sm">
            <span className="font-medium">{doc.name}</span>{" "}
            <span className="text-fg-muted">· {doc.pageCount} pages</span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Position">
              {(id) => (
                <select id={id} className={selectClass} value={position} onChange={(e) => setPosition(e.target.value as "top" | "bottom")}>
                  <option value="bottom">Bottom</option>
                  <option value="top">Top</option>
                </select>
              )}
            </Field>
            <Field label="Alignment">
              {(id) => (
                <select id={id} className={selectClass} value={alignment} onChange={(e) => setAlignment(e.target.value as "left" | "center" | "right")}>
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              )}
            </Field>
            <Field label="Start number">
              {(id) => (
                <input id={id} type="number" min={0} className={inputClass} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value))} />
              )}
            </Field>
            <Field label="Prefix" hint='Example: "Page "'>
              {(id) => (
                <input id={id} className={inputClass} maxLength={24} value={prefix} onChange={(e) => setPrefix(e.target.value)} />
              )}
            </Field>
            <Field label="Suffix" hint={`Example: " of ${doc.pageCount}"`}>
              {(id) => (
                <input id={id} className={inputClass} maxLength={24} value={suffix} onChange={(e) => setSuffix(e.target.value)} />
              )}
            </Field>
            <Field label="Skip first pages" hint="Useful for cover pages.">
              {(id) => (
                <input id={id} type="number" min={0} max={doc.pageCount - 1} className={inputClass} value={skipFirst} onChange={(e) => setSkipFirst(Number(e.target.value))} />
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
              Add page numbers
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
