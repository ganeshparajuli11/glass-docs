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
import { extractPages, splitByRanges, splitEveryPage } from "@/lib/pdf/operations/split";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { displayStem, formatBytes, outputFileName } from "@/lib/files/format";

type Mode = "combined" | "per-range" | "every-page";

export default function SplitPdfTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array; pageCount: number } | null>(null);
  const [mode, setMode] = useState<Mode>("combined");
  const [rangeText, setRangeText] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [state, setState] = useState<ToolState>({ status: "idle" });

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "success") prev.results.forEach(revokeResult);
      return { status: "idle" };
    });
    setDoc(null);
    setRangeText("");
    setRangeError(null);
  }, []);

  const onFiles = async (incoming: File[]) => {
    const file = incoming[0];
    const bytes = await fileToBytes(file);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 50 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    try {
      const parsed = await loadPdf(bytes);
      setDoc({ name: file.name, bytes, pageCount: parsed.getPageCount() });
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
    let parsedRanges: ReturnType<typeof parsePageRanges> | null = null;
    if (mode !== "every-page") {
      parsedRanges = parsePageRanges(rangeText, doc.pageCount);
      if (!parsedRanges.ok) {
        setRangeError(`Invalid: ${parsedRanges.invalidTokens.join(", ") || "empty selection"}`);
        return;
      }
      setRangeError(null);
    }
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Splitting…" },
    });
    try {
      const stem = displayStem(doc.name);
      if (mode === "combined" && parsedRanges?.ok) {
        const bytes = await extractPages(doc.bytes, parsedRanges.pages);
        setState({
          status: "success",
          results: [makeResult(bytes, outputFileName(`${stem}-pages`, "pdf"), "application/pdf")],
        });
      } else {
        const parts =
          mode === "every-page"
            ? await splitEveryPage(doc.bytes, doc.pageCount, (done, total) =>
                setState({
                  status: "processing",
                  progress: {
                    stage: "processing",
                    fraction: done / total,
                    label: `Creating file ${done} of ${total}…`,
                  },
                }),
              )
            : await splitByRanges(doc.bytes, parsedRanges!.ok ? parsedRanges!.ranges : []);
        setState({
          status: "success",
          results: parts.map((p) =>
            makeResult(p.bytes, `${stem}-${p.nameHint}.pdf`, "application/pdf"),
          ),
        });
      }
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
          hint="Split by page ranges or into one file per page. Recommended size under 50 MB."
        />
      ) : (
        <div>
          <p className="text-sm">
            <span className="font-medium">{doc.name}</span>{" "}
            <span className="text-fg-muted">
              · {doc.pageCount} pages · {formatBytes(doc.bytes.length)}
            </span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Split mode">
              {(id) => (
                <select
                  id={id}
                  className={selectClass}
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                >
                  <option value="combined">Selected pages → one PDF</option>
                  <option value="per-range">One PDF per range</option>
                  <option value="every-page">Every page separately</option>
                </select>
              )}
            </Field>
            {mode !== "every-page" ? (
              <Field label="Pages" hint={`Example: 1-3, 5, 8-10 (document has ${doc.pageCount} pages)`}>
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    value={rangeText}
                    onChange={(e) => setRangeText(e.target.value)}
                    placeholder="1-3, 5"
                    aria-invalid={rangeError !== null}
                  />
                )}
              </Field>
            ) : null}
          </div>
          {rangeError ? (
            <p role="alert" className="mt-2 text-sm text-error">
              {rangeError}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={process}
              disabled={state.status === "processing"}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              Split PDF
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
      {state.status === "error" ? <ErrorPanel error={state.error} onReset={reset} /> : null}
    </div>
  );
}
