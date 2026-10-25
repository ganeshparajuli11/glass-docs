"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ImagePlus, RotateCcw } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { ErrorPanel, ProgressPanel } from "@/components/tool/Panels";
import type { ProgressState } from "@/lib/pdf/contracts";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { displayStem, formatBytes } from "@/lib/files/format";
import { makeResult, revokeResult, triggerDownload } from "@/lib/files/download";
import {
  downloadSizeMb,
  MAX_OCR_LANGUAGES,
  OCR_LANGUAGES,
  toTesseractLangs,
  type OcrLanguageCode,
} from "@/lib/ocr/languages";
import { countWords, formatOcrText, summariseConfidence, type LayoutMode } from "@/lib/ocr/text";
import type { OcrEngine } from "@/lib/ocr/engine";

type State =
  | { status: "idle" }
  | { status: "processing"; progress: ProgressState }
  | { status: "done"; raw: string; confidence: number }
  | { status: "error"; error: ToolError };

const ACCEPT = "image/jpeg,image/png,image/webp";
const border = { borderColor: "var(--glass-strong-border)" } as const;

export default function ImageToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [langs, setLangs] = useState<OcrLanguageCode[]>(["eng"]);
  const [layout, setLayout] = useState<LayoutMode>("lines");
  const [state, setState] = useState<State>({ status: "idle" });
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const engineRef = useRef<OcrEngine | null>(null);

  // Tear the worker down when leaving the page.
  useEffect(
    () => () => {
      void engineRef.current?.terminate();
      engineRef.current = null;
    },
    [],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const accept = useCallback((f: File | undefined) => {
    if (!f) return;
    const check = validateImageFile(f, { maxRecommendedSizeMb: 25 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setEdited(null);
    setState({ status: "idle" });
  }, []);

  // Screenshots are the most common OCR input: allow Ctrl/Cmd+V anywhere on the page.
  useEffect(() => {
    if (state.status === "processing") return;
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const pasted = item?.getAsFile();
      if (!pasted) return;
      e.preventDefault();
      const ext = pasted.type.split("/")[1] ?? "png";
      accept(new File([pasted], `pasted-image.${ext}`, { type: pasted.type }));
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [accept, state.status]);

  const toggleLang = (code: OcrLanguageCode) => {
    setLangs((prev) => {
      if (prev.includes(code)) return prev.length === 1 ? prev : prev.filter((c) => c !== code);
      if (prev.length >= MAX_OCR_LANGUAGES) return prev;
      return [...prev, code];
    });
  };

  const run = async () => {
    if (!file) return;
    const wanted = toTesseractLangs(langs);
    setEdited(null);
    setState({
      status: "processing",
      progress: { stage: "parsing", fraction: null, label: "Preparing the image…" },
    });
    try {
      const { createOcrEngine, prepareImage } = await import("@/lib/ocr/engine");
      const canvas = await prepareImage(file);
      const onProgress = (progress: ProgressState) => setState({ status: "processing", progress });
      let engine = engineRef.current;
      if (!engine || engine.langs !== wanted) {
        await engine?.terminate();
        engineRef.current = null;
        engine = await createOcrEngine(wanted, onProgress);
        engineRef.current = engine;
      }
      const { text, confidence } = await engine.recognize(canvas);
      canvas.width = 0;
      canvas.height = 0;
      setState({ status: "done", raw: text, confidence });
    } catch (err) {
      void engineRef.current?.terminate();
      engineRef.current = null;
      setState({
        status: "error",
        error:
          err instanceof RangeError
            ? toolError("MEMORY_LIMIT_REACHED")
            : typeof WebAssembly === "undefined"
              ? toolError("BROWSER_UNSUPPORTED")
              : {
                  code: "UNKNOWN_PROCESSING_ERROR",
                  message: "The image could not be read.",
                  recovery:
                    "Check your connection if this is the first run (the OCR engine and language model load from this site once), then try again — or try a JPG or PNG copy of the image.",
                },
      });
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setEdited(null);
    setState({ status: "idle" });
  };

  const formatted = useMemo(
    () => (state.status === "done" ? formatOcrText(state.raw, layout) : ""),
    [state, layout],
  );
  const text = edited ?? formatted;
  const summary =
    state.status === "done" ? summariseConfidence(state.confidence, formatted.length) : null;

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
    if (!file) return;
    const result = makeResult(new TextEncoder().encode(text), `${displayStem(file.name)}.txt`, "text/plain");
    triggerDownload(result);
    window.setTimeout(() => revokeResult(result), 5000);
  };

  const busy = state.status === "processing";
  const firstUseMb = downloadSizeMb(toTesseractLangs(langs));

  return (
    <div>
      {!file ? (
        <FileDrop
          accept={ACCEPT}
          onFiles={(files) => accept(files[0])}
          label="Drop an image here, or paste a screenshot"
          hint="JPG, PNG or WebP. Text is recognised on your device — the image is never uploaded."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="min-w-0">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img
                src={previewUrl}
                alt="The image being read"
                className="max-h-80 w-full rounded-(--radius-sm) border object-contain"
                style={border}
              />
            ) : null}
            <p className="break-anywhere mt-2 text-xs text-fg-muted">
              {file.name} · {formatBytes(file.size)}
            </p>
          </div>
          <div className="min-w-0">
            <fieldset>
              <legend className="text-sm font-medium">Language in the image</legend>
              <p className="text-xs text-fg-muted">Pick up to {MAX_OCR_LANGUAGES}. Fewer languages read faster and more accurately.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {OCR_LANGUAGES.map((l) => {
                  const checked = langs.includes(l.code);
                  const blocked = !checked && langs.length >= MAX_OCR_LANGUAGES;
                  return (
                    <label
                      key={l.code}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm focus-within:ring-2 focus-within:ring-accent"
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
                    ["lines", "Keep as in the image"],
                    ["paragraphs", "Join into paragraphs"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm focus-within:ring-2 focus-within:ring-accent"
                    style={{
                      borderColor: layout === value ? "var(--accent)" : "var(--glass-strong-border)",
                      background: layout === value ? "var(--accent-soft)" : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="ocr-layout"
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
                <ImagePlus className="h-4 w-4" aria-hidden="true" /> Another image
              </button>
            </div>
            {state.status === "idle" ? (
              <p className="mt-3 text-xs text-fg-subtle">
                First run downloads the OCR engine (about 4 MB) and the language
                model{langs.length > 1 ? "s" : ""} (about {firstUseMb} MB) from this
                site; your browser keeps them for next time.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {state.status === "processing" ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "error" ? (
        <ErrorPanel error={state.error} onReset={() => (file ? setState({ status: "idle" }) : reset())} />
      ) : null}

      {state.status === "done" && summary ? (
        <div className="solid-reading mt-6 p-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Recognised text</h2>
            <p className="text-xs text-fg-muted">
              {countWords(text)} words · confidence{" "}
              <span
                className={
                  summary.level === "good" ? "font-semibold text-success" : summary.level === "poor" ? "font-semibold text-error" : "font-semibold"
                }
              >
                {summary.score}%
              </span>
            </p>
          </div>
          <p className="mt-1 text-sm text-fg-muted">{summary.advice}</p>
          <textarea
            value={text}
            onChange={(e) => setEdited(e.target.value)}
            aria-label="Recognised text (editable)"
            spellCheck
            className="mt-3 h-72 w-full resize-y rounded-(--radius-sm) border bg-transparent p-3 text-sm leading-relaxed"
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
