"use client";

import { useCallback, useRef, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { FileList, type ListedFile } from "@/components/tool/FileList";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { mergePdfs } from "@/lib/pdf/operations/merge";
import { PdfOperationError } from "@/lib/pdf/operations/load";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { outputFileName } from "@/lib/files/format";

export default function MergePdfTool() {
  const [files, setFiles] = useState<ListedFile[]>([]);
  const [state, setState] = useState<ToolState>({ status: "idle" });
  const idCounter = useRef(0);

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "success") prev.results.forEach(revokeResult);
      return { status: "idle" };
    });
    setFiles([]);
  }, []);

  const addFiles = (incoming: File[]) => {
    const pdfs = incoming.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    setFiles((prev) => [
      ...prev,
      ...pdfs.map((file) => ({ id: `f${(idCounter.current += 1)}`, file })),
    ]);
    if (pdfs.length !== incoming.length) {
      setState({ status: "error", error: toolError("FILE_TYPE_UNSUPPORTED") });
    } else if (state.status === "error") {
      setState({ status: "idle" });
    }
  };

  const process = async () => {
    setState({
      status: "processing",
      progress: { stage: "parsing", fraction: 0, label: "Reading files…" },
    });
    try {
      const sources: Uint8Array[] = [];
      for (const f of files) {
        const bytes = await fileToBytes(f.file);
        const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 50 });
        if (!check.ok) {
          setState({ status: "error", error: check.error });
          return;
        }
        sources.push(bytes);
      }
      const merged = await mergePdfs({
        sources,
        onProgress: (done, total) =>
          setState({
            status: "processing",
            progress: {
              stage: "processing",
              fraction: done / total,
              label: `Merging file ${done} of ${total}…`,
            },
          }),
      });
      setState({
        status: "success",
        results: [makeResult(merged, outputFileName("merged", "pdf"), "application/pdf")],
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
      <FileDrop
        accept="application/pdf,.pdf"
        multiple
        onFiles={addFiles}
        label="Drop PDF files here"
        hint="Add two or more PDFs, arrange the order, then merge. Recommended total under 50 MB."
        disabled={state.status === "processing"}
      />
      {files.length > 0 ? (
        <>
          <FileList
            files={files}
            reorderable
            onMove={(i, dir) =>
              setFiles((prev) => {
                const next = prev.slice();
                const t = i + dir;
                if (t < 0 || t >= next.length) return prev;
                [next[i], next[t]] = [next[t], next[i]];
                return next;
              })
            }
            onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={process}
              disabled={files.length < 2 || state.status === "processing"}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              Merge {files.length} file{files.length === 1 ? "" : "s"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              Reset
            </button>
            {files.length < 2 ? (
              <p className="text-sm text-fg-muted">Add at least two PDFs to merge.</p>
            ) : null}
          </div>
        </>
      ) : null}
      {state.status === "processing" ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "error" ? <ErrorPanel error={state.error} onReset={() => setState({ status: "idle" })} /> : null}
    </div>
  );
}
