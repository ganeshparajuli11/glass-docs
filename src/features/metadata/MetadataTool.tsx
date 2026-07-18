"use client";

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, inputClass } from "@/components/tool/Field";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { loadPdf, PdfOperationError } from "@/lib/pdf/operations/load";
import { readMetadata, writeMetadata, type PdfMetadata } from "@/lib/pdf/operations/metadata";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { displayStem, formatBytes } from "@/lib/files/format";

export default function MetadataTool() {
  const [doc, setDoc] = useState<{
    name: string;
    bytes: Uint8Array;
    meta: PdfMetadata;
    pageSize: { width: number; height: number } | null;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
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
      const meta = await readMetadata(bytes);
      const parsed = await loadPdf(bytes);
      const first = parsed.getPageCount() > 0 ? parsed.getPage(0).getSize() : null;
      setDoc({
        name: incoming[0].name,
        bytes,
        meta,
        pageSize: first ? { width: Math.round(first.width), height: Math.round(first.height) } : null,
      });
      setTitle(meta.title);
      setAuthor(meta.author);
      setSubject(meta.subject);
      setKeywords(meta.keywords);
      setState({ status: "idle" });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof PdfOperationError ? err.toolError : toolError("PDF_PARSE_FAILED"),
      });
    }
  };

  const save = async () => {
    if (!doc) return;
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Updating metadata…" },
    });
    try {
      const bytes = await writeMetadata(doc.bytes, { title, author, subject, keywords });
      setState({
        status: "success",
        results: [makeResult(bytes, `${displayStem(doc.name)}-updated.pdf`, "application/pdf")],
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
          hint="See document information and edit the standard metadata fields."
        />
      ) : (
        <div>
          <div className="solid-reading p-4">
            <h2 className="text-sm font-semibold">Document information</h2>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 sm:justify-start">
                <dt className="text-fg-muted">Pages</dt>
                <dd>{doc.meta.pageCount}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:justify-start">
                <dt className="text-fg-muted">File size</dt>
                <dd>{formatBytes(doc.bytes.length)}</dd>
              </div>
              {doc.pageSize ? (
                <div className="flex justify-between gap-4 sm:justify-start">
                  <dt className="text-fg-muted">First page</dt>
                  <dd>
                    {doc.pageSize.width} × {doc.pageSize.height} pt
                  </dd>
                </div>
              ) : null}
              {doc.meta.producer ? (
                <div className="flex justify-between gap-4 sm:justify-start">
                  <dt className="text-fg-muted">Producer</dt>
                  <dd className="truncate">{doc.meta.producer}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              {(id) => <input id={id} className={inputClass} maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} />}
            </Field>
            <Field label="Author">
              {(id) => <input id={id} className={inputClass} maxLength={300} value={author} onChange={(e) => setAuthor(e.target.value)} />}
            </Field>
            <Field label="Subject">
              {(id) => <input id={id} className={inputClass} maxLength={300} value={subject} onChange={(e) => setSubject(e.target.value)} />}
            </Field>
            <Field label="Keywords" hint="Separate with commas.">
              {(id) => <input id={id} className={inputClass} maxLength={500} value={keywords} onChange={(e) => setKeywords(e.target.value)} />}
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={state.status === "processing"}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              Save updated PDF
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
