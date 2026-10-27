"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { destroyDocument, extractPageText, openDocument, PdfOpenError } from "@/lib/pdf/pdfjs";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { displayStem } from "@/lib/files/format";

export default function ExtractTextTool() {
  const [state, setState] = useState<ToolState>({ status: "idle" });
  const [preview, setPreview] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "success") prev.results.forEach(revokeResult);
      return { status: "idle" };
    });
    setPreview(null);
  }, []);

  const onFiles = async (incoming: File[]) => {
    const bytes = await fileToBytes(incoming[0]);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 40 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    setState({
      status: "processing",
      progress: { stage: "parsing", fraction: null, label: "Opening PDF…" },
    });
    let pdf: Awaited<ReturnType<typeof openDocument>> | null = null;
    try {
      pdf = await openDocument(bytes);
      const chunks: string[] = [];
      for (let p = 1; p <= pdf.numPages; p += 1) {
        setState({
          status: "processing",
          progress: {
            stage: "processing",
            fraction: p / pdf.numPages,
            label: `Reading page ${p} of ${pdf.numPages}…`,
          },
        });
        const { text } = await extractPageText(pdf, p);
        if (text.length > 0) chunks.push(text);
      }
      const full = chunks.join("\n\n");
      if (full.trim().length === 0) {
        setPreview(null);
        setState({
          status: "error",
          error: {
            code: "OUTPUT_FAILED",
            message: "No selectable text was found in this PDF.",
            recovery:
              "It is probably a scanned document. Open it in Scanned PDF to text (OCR), which reads each page on your device.",
          },
        });
        return;
      }
      setPreview(full.length > 4000 ? `${full.slice(0, 4000)}…` : full);
      setState({
        status: "success",
        results: [
          makeResult(
            new TextEncoder().encode(full),
            `${displayStem(incoming[0].name)}.txt`,
            "text/plain",
          ),
        ],
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

  return (
    <div>
      {state.status === "idle" ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          label="Drop a PDF here"
          hint="Extracts selectable text. For scanned pages, use Scanned PDF to text (OCR) instead."
        />
      ) : null}
      {state.status === "processing" ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "error" ? <ErrorPanel error={state.error} onReset={reset} /> : null}
      {state.status === "success" ? (
        <>
          {preview ? (
            <div className="solid-reading mt-2 p-4">
              <h2 className="text-sm font-semibold">Preview</h2>
              <textarea
                readOnly
                value={preview}
                aria-label="Extracted text preview"
                className="mt-2 h-56 w-full resize-y rounded-(--radius-sm) border bg-transparent p-3 text-sm"
                style={{ borderColor: "var(--glass-strong-border)" }}
              />
            </div>
          ) : null}
          <SuccessPanel results={state.results} onReset={reset} />
        </>
      ) : null}
    </div>
  );
}
