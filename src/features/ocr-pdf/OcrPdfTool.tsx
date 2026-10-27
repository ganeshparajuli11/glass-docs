"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FilePlus2, RotateCcw } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { Field, inputClass } from "@/components/tool/Field";
import { ErrorPanel, ProgressPanel } from "@/components/tool/Panels";
import type { ProgressState } from "@/lib/pdf/contracts";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { destroyDocument, openDocument, PdfOpenError, renderPageToCanvas } from "@/lib/pdf/pdfjs";
import { fileToBytes, makeResult, revokeResult, triggerDownload } from "@/lib/files/download";
import { displayStem, formatBytes } from "@/lib/files/format";
import {
  downloadSizeMb,
  MAX_OCR_LANGUAGES,
  OCR_LANGUAGES,
  toTesseractLangs,
  type OcrLanguageCode,
} from "@/lib/ocr/languages";
import { countWords, summariseConfidence, type LayoutMode } from "@/lib/ocr/text";
import {
  combinePageTexts,
  hasUsableTextLayer,
  listPages,
  MAX_OCR_PAGES,
  pdfOcrScale,
  selectOcrPages,
  summarisePdfOcr,
  textFromItems,
  type PdfPageResult,
} from "@/lib/ocr/pdf";
import type { OcrEngine } from "@/lib/ocr/engine";

type State =
  | { status: "idle" }
  | { status: "processing"; progress: ProgressState }
  | { status: "done"; pages: PdfPageResult[]; requested: number; stopped: boolean }
  | { status: "error"; error: ToolError };

interface LoadedPdf {
  name: string;
  size: number;
  bytes: Uint8Array;
  pageCount: number;
}

const border = { borderColor: "var(--glass-strong-border)" } as const;
const pill =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm focus-within:ring-2 focus-within:ring-accent";

export default function OcrPdfTool() {
  const [doc, setDoc] = useState<LoadedPdf | null>(null);
  const [range, setRange] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [langs, setLangs] = useState<OcrLanguageCode[]>(["eng"]);
  const [layout, setLayout] = useState<LayoutMode>("lines");
  const [markers, setMarkers] = useState(true);
  const [useTextLayer, setUseTextLayer] = useState(true);
  const [state, setState] = useState<State>({ status: "idle" });
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const engineRef = useRef<OcrEngine | null>(null);
  const cancelRef = useRef(false);

  useEffect(
    () => () => {
      cancelRef.current = true;
      void engineRef.current?.terminate();
      engineRef.current = null;
    },
    [],
  );

  const onFiles = async (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    const bytes = await fileToBytes(file);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 60 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    setState({ status: "processing", progress: { stage: "parsing", fraction: null, label: "Opening PDF…" } });
    let pdf: Awaited<ReturnType<typeof openDocument>> | null = null;
    try {
      pdf = await openDocument(bytes);
      setDoc({ name: file.name, size: file.size, bytes, pageCount: pdf.numPages });
      setRange("");
      setRangeError(null);
      setEdited(null);
      setState({ status: "idle" });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof PdfOpenError ? err.toolError : toolError("UNKNOWN_PROCESSING_ERROR"),
      });
    } finally {
      if (pdf) void destroyDocument(pdf);
    }
  };

  const toggleLang = (code: OcrLanguageCode) => {
    setLangs((prev) => {
      if (prev.includes(code)) return prev.length === 1 ? prev : prev.filter((c) => c !== code);
      if (prev.length >= MAX_OCR_LANGUAGES) return prev;
      return [...prev, code];
    });
  };

  const run = async () => {
    if (!doc) return;
    const selection = selectOcrPages(range, doc.pageCount);
    if (!selection.ok) {
      setRangeError(selection.message);
      return;
    }
    setRangeError(null);
    setEdited(null);
    cancelRef.current = false;
    const wanted = toTesseractLangs(langs);
    const total = selection.pages.length;
    const results: PdfPageResult[] = [];
    let current = 0;
    const show = (fraction: number | null, label: string, stage: ProgressState["stage"] = "processing") =>
      setState({ status: "processing", progress: { stage, fraction, label } });

    show(null, "Opening PDF…", "parsing");
    let pdf: Awaited<ReturnType<typeof openDocument>> | null = null;
    try {
      const { createOcrEngine } = await import("@/lib/ocr/engine");
      pdf = await openDocument(doc.bytes);
      for (const pageNumber of selection.pages) {
        if (cancelRef.current) break;
        const prefix = `Page ${current + 1} of ${total}`;
        show(current / total, `${prefix}: checking for existing text…`);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        let layerText = "";
        if (useTextLayer) {
          const content = await page.getTextContent();
          layerText = textFromItems(content.items as Array<{ str?: string; hasEOL?: boolean }>);
        }
        page.cleanup();
        if (useTextLayer && hasUsableTextLayer(layerText)) {
          results.push({ pageNumber, text: layerText, source: "text-layer", confidence: null });
          current += 1;
          continue;
        }

        let engine = engineRef.current;
        if (!engine || engine.langs !== wanted) {
          await engine?.terminate();
          engineRef.current = null;
          engine = await createOcrEngine(wanted, (p) => {
            // Engine/model loading has its own labels; recognition is mapped onto overall progress.
            if (p.label.startsWith("Reading")) {
              show((current + (p.fraction ?? 0)) / total, `${prefix}: reading text…`);
            } else {
              show(p.fraction, p.label, p.stage);
            }
          });
          engineRef.current = engine;
        }
        if (cancelRef.current) break;
        show(current / total, `${prefix}: rendering the page…`);
        const rendered = await renderPageToCanvas(pdf, pageNumber, pdfOcrScale(viewport.width, viewport.height));
        try {
          show(current / total, `${prefix}: reading text…`);
          const { text, confidence } = await engine.recognize(rendered.canvas);
          results.push({ pageNumber, text, source: "ocr", confidence });
        } finally {
          rendered.canvas.width = 0;
          rendered.canvas.height = 0;
        }
        current += 1;
      }
      setState({ status: "done", pages: results, requested: total, stopped: cancelRef.current });
    } catch (err) {
      void engineRef.current?.terminate();
      engineRef.current = null;
      if (cancelRef.current) {
        setState({ status: "done", pages: results, requested: total, stopped: true });
        return;
      }
      setState({
        status: "error",
        error:
          err instanceof PdfOpenError
            ? err.toolError
            : err instanceof RangeError
              ? toolError("MEMORY_LIMIT_REACHED")
              : typeof WebAssembly === "undefined"
                ? toolError("BROWSER_UNSUPPORTED")
                : {
                    code: "UNKNOWN_PROCESSING_ERROR",
                    message: `Page ${selection.pages[current] ?? ""} could not be read.`,
                    recovery:
                      "Check your connection if this is the first run (the OCR engine and language model load from this site once), then try again — or read fewer pages at a time.",
                  },
      });
    } finally {
      if (pdf) void destroyDocument(pdf);
    }
  };

  const cancel = () => {
    cancelRef.current = true;
    // Stopping the worker aborts the page being read right now.
    void engineRef.current?.terminate();
    engineRef.current = null;
  };

  const reset = () => {
    cancelRef.current = true;
    setDoc(null);
    setRange("");
    setRangeError(null);
    setEdited(null);
    setState({ status: "idle" });
  };

  const combined = useMemo(
    () => (state.status === "done" ? combinePageTexts(state.pages, { layout, markers }) : ""),
    [state, layout, markers],
  );
  const text = edited ?? combined;
  const summary = state.status === "done" ? summarisePdfOcr(state.pages) : null;
  const confidence =
    summary && summary.confidence !== null
      ? summariseConfidence(
          summary.confidence,
          state.status === "done"
            ? state.pages.filter((p) => p.source === "ocr").reduce((n, p) => n + p.text.trim().length, 0)
            : 0,
        )
      : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (!doc) return;
    const result = makeResult(new TextEncoder().encode(text), `${displayStem(doc.name)}-text.txt`, "text/plain");
    triggerDownload(result);
    window.setTimeout(() => revokeResult(result), 5000);
  };

  const busy = state.status === "processing";
  const firstUseMb = downloadSizeMb(toTesseractLangs(langs));

  return (
    <div>
      {!doc ? (
        busy ? null : (
          <FileDrop
            accept="application/pdf,.pdf"
            onFiles={onFiles}
            label="Drop a scanned PDF here"
            hint="Pages are rendered and read on your device — the PDF is never uploaded."
          />
        )
      ) : (
        <div>
          <p className="break-anywhere text-sm font-medium">
            {doc.name}{" "}
            <span className="font-normal text-fg-muted">
              · {doc.pageCount} page{doc.pageCount === 1 ? "" : "s"} · {formatBytes(doc.size)}
            </span>
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div className="min-w-0">
              <Field
                label="Pages to read"
                hint={`Leave empty for all pages, or type a range such as 1-3, 5. Up to ${MAX_OCR_PAGES} pages per run.`}
              >
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    value={range}
                    placeholder={doc.pageCount > 1 ? `All (1-${doc.pageCount})` : "All"}
                    disabled={busy}
                    aria-invalid={rangeError ? true : undefined}
                    onChange={(e) => {
                      setRange(e.target.value);
                      setRangeError(null);
                    }}
                  />
                )}
              </Field>
              {rangeError ? (
                <p role="alert" className="mt-1 text-sm text-error">
                  {rangeError}
                </p>
              ) : null}
              <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={useTextLayer}
                  disabled={busy}
                  onChange={(e) => setUseTextLayer(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-(--accent)"
                />
                <span>
                  Use the PDF&apos;s own text where a page already has it
                  <span className="block text-xs text-fg-muted">
                    Exact and instant. Untick to force OCR on every page (for a broken or garbled text layer).
                  </span>
                </span>
              </label>
            </div>
            <div className="min-w-0">
              <fieldset>
                <legend className="text-sm font-medium">Language in the document</legend>
                <p className="text-xs text-fg-muted">Pick up to {MAX_OCR_LANGUAGES}. Fewer languages read faster and more accurately.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {OCR_LANGUAGES.map((l) => {
                    const checked = langs.includes(l.code);
                    const blocked = !checked && langs.length >= MAX_OCR_LANGUAGES;
                    return (
                      <label
                        key={l.code}
                        className={pill}
                        style={{
                          borderColor: checked ? "var(--accent)" : "var(--glass-strong-border)",
                          background: checked ? "var(--accent-soft)" : undefined,
                          opacity: blocked ? 0.5 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={busy || blocked}
                          onChange={() => toggleLang(l.code)}
                          className="h-4 w-4 accent-(--accent)"
                        />
                        {l.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset className="mt-4">
                <legend className="text-sm font-medium">Line breaks</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["lines", "Keep as printed"],
                      ["paragraphs", "Join into paragraphs"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={pill}
                      style={{
                        borderColor: layout === value ? "var(--accent)" : "var(--glass-strong-border)",
                        background: layout === value ? "var(--accent-soft)" : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="ocr-pdf-layout"
                        value={value}
                        checked={layout === value}
                        onChange={() => {
                          setLayout(value);
                          setEdited(null);
                        }}
                        className="h-4 w-4 accent-(--accent)"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={markers}
                  onChange={(e) => {
                    setMarkers(e.target.checked);
                    setEdited(null);
                  }}
                  className="h-5 w-5 shrink-0 accent-(--accent)"
                />
                Mark where each page starts
              </label>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              {state.status === "done" ? "Read again" : "Extract text"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted disabled:opacity-40"
              style={border}
            >
              <FilePlus2 className="h-4 w-4" aria-hidden="true" /> Another PDF
            </button>
          </div>
          {state.status === "idle" ? (
            <p className="mt-3 text-xs text-fg-subtle">
              Expect a few seconds per page on a laptop, longer on a phone. The first run also downloads
              the OCR engine (about 4 MB) and the language model{langs.length > 1 ? "s" : ""} (about{" "}
              {firstUseMb} MB) from this site; your browser keeps them for next time.
            </p>
          ) : null}
        </div>
      )}

      {state.status === "processing" ? (
        <ProgressPanel progress={state.progress} onCancel={doc ? cancel : undefined} />
      ) : null}
      {state.status === "error" ? (
        <ErrorPanel error={state.error} onReset={() => (doc ? setState({ status: "idle" }) : reset())} />
      ) : null}

      {state.status === "done" && summary ? (
        <div className="solid-reading mt-6 p-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Text from the PDF</h2>
            <p className="text-xs text-fg-muted">
              {countWords(text)} words
              {confidence ? (
                <>
                  {" "}
                  · OCR confidence{" "}
                  <span
                    className={
                      confidence.level === "good"
                        ? "font-semibold text-success"
                        : confidence.level === "poor"
                          ? "font-semibold text-error"
                          : "font-semibold"
                    }
                  >
                    {confidence.score}%
                  </span>
                </>
              ) : null}
            </p>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-fg-muted">
            {state.stopped ? (
              <li>
                {state.pages.length === 0
                  ? "Stopped before the first page was finished."
                  : `Stopped after ${state.pages.length} of ${state.requested} pages. The text below covers only those.`}
              </li>
            ) : null}
            {summary.ocrPages > 0 ? (
              <li>
                {summary.ocrPages} page{summary.ocrPages === 1 ? "" : "s"} read with OCR — proofread names,
                numbers and dates against the PDF.
              </li>
            ) : null}
            {summary.textLayerPages > 0 ? (
              <li>
                {summary.textLayerPages} page{summary.textLayerPages === 1 ? "" : "s"} already had real text, copied
                exactly without OCR.
              </li>
            ) : null}
            {summary.emptyPages.length > 0 ? (
              <li>No text found on {listPages(summary.emptyPages)} (blank, a picture, or handwriting).</li>
            ) : null}
            {confidence && confidence.level !== "good" ? <li>{confidence.advice}</li> : null}
          </ul>
          <textarea
            value={text}
            onChange={(e) => setEdited(e.target.value)}
            aria-label="Text from the PDF (editable)"
            spellCheck
            className="mt-3 h-80 w-full resize-y rounded-(--radius-sm) border bg-transparent p-3 text-sm leading-relaxed"
            style={border}
          />
          <p className="mt-1 text-xs text-fg-subtle">You can correct mistakes here before copying or downloading.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copy}
              disabled={text.length === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy text"}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={text.length === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium disabled:opacity-40"
              style={border}
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Download .txt
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium text-fg-muted"
              style={border}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start over
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
