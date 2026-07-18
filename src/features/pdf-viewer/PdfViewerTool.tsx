"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { ErrorPanel, ProgressPanel } from "@/components/tool/Panels";
import type { ProgressState } from "@/lib/pdf/contracts";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { destroyDocument, openDocument, renderPageToCanvas, PdfOpenError } from "@/lib/pdf/pdfjs";
import { fileToBytes } from "@/lib/files/download";

type ViewerState =
  | { status: "idle" }
  | { status: "loading"; progress: ProgressState }
  | { status: "ready" }
  | { status: "error"; error: ToolError };

export default function PdfViewerTool() {
  const [state, setState] = useState<ViewerState>({ status: "idle" });
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1.2);
  const docRef = useRef<Awaited<ReturnType<typeof openDocument>> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    if (docRef.current) void destroyDocument(docRef.current);
    docRef.current = null;
    setState({ status: "idle" });
    setPage(1);
    setPageCount(0);
  }, []);

  useEffect(() => () => reset(), [reset]);

  const renderCurrent = useCallback(async (pageNum: number, scale: number) => {
    const doc = docRef.current;
    const container = containerRef.current;
    if (!doc || !container) return;
    try {
      const rendered = await renderPageToCanvas(doc, pageNum, scale);
      rendered.canvas.className = "mx-auto block max-w-full rounded shadow";
      rendered.canvas.setAttribute("role", "img");
      rendered.canvas.setAttribute("aria-label", `Page ${pageNum} of ${doc.numPages}`);
      container.replaceChildren(rendered.canvas);
    } catch {
      // keep previous page visible on transient render failure
    }
  }, []);

  useEffect(() => {
    if (state.status === "ready") void renderCurrent(page, zoom);
  }, [state.status, page, zoom, renderCurrent]);

  const onFiles = async (incoming: File[]) => {
    const bytes = await fileToBytes(incoming[0]);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 60 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    setState({
      status: "loading",
      progress: { stage: "parsing", fraction: null, label: "Opening PDF…" },
    });
    try {
      const doc = await openDocument(bytes);
      docRef.current = doc;
      setPageCount(doc.numPages);
      setPage(1);
      setState({ status: "ready" });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof PdfOpenError ? err.toolError : toolError("UNKNOWN_PROCESSING_ERROR"),
      });
    }
  };

  return (
    <div>
      {state.status === "idle" ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          label="Drop a PDF here to read it"
          hint="Private viewing with zoom and page navigation. Nothing is uploaded."
        />
      ) : null}
      {state.status === "loading" ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "error" ? <ErrorPanel error={state.error} onReset={reset} /> : null}
      {state.status === "ready" ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1" role="group" aria-label="Page navigation">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="min-w-24 text-center text-sm" aria-live="polite">
                Page {page} / {pageCount}
              </p>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center gap-1" role="group" aria-label="Zoom">
              <button
                type="button"
                aria-label="Zoom out"
                disabled={zoom <= 0.6}
                onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
              >
                <ZoomOut className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="min-w-14 text-center text-sm">{Math.round(zoom * 100)}%</p>
              <button
                type="button"
                aria-label="Zoom in"
                disabled={zoom >= 3}
                onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.2) * 10) / 10))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
              >
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              Close document
            </button>
          </div>
          <div
            ref={containerRef}
            className="mt-4 max-h-[75vh] overflow-auto rounded-(--radius-md) p-2"
            style={{ background: "var(--bg-base)" }}
          />
        </div>
      ) : null}
    </div>
  );
}
