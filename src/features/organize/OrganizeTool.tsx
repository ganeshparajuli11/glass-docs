"use client";

/** Shared tool for rotate / reorder / delete / extract, built on PageOrganizer. */

import { useCallback, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import {
  PageOrganizer,
  initialPages,
  type OrganizerPage,
} from "@/components/tool/PageOrganizer";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import { loadPdf, PdfOperationError } from "@/lib/pdf/operations/load";
import { organizePdf, type PageInstruction } from "@/lib/pdf/operations/organize";
import { fileToBytes, makeResult, revokeResult } from "@/lib/files/download";
import { displayStem, formatBytes } from "@/lib/files/format";

export type OrganizeMode = "rotate" | "reorder" | "delete" | "extract";

const MODE_CONFIG: Record<
  OrganizeMode,
  {
    capabilities: { select?: boolean; reorder?: boolean; rotate?: boolean; delete?: boolean };
    action: string;
    suffix: string;
  }
> = {
  rotate: { capabilities: { rotate: true, select: false }, action: "Apply rotation", suffix: "rotated" },
  reorder: { capabilities: { reorder: true }, action: "Save new order", suffix: "reordered" },
  delete: { capabilities: { delete: true }, action: "Save without deleted pages", suffix: "edited" },
  extract: { capabilities: { select: true }, action: "Extract selected pages", suffix: "extracted" },
};

export default function OrganizeTool({ mode }: { mode: OrganizeMode }) {
  const config = MODE_CONFIG[mode];
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [pages, setPages] = useState<OrganizerPage[]>([]);
  const [state, setState] = useState<ToolState>({ status: "idle" });

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "success") prev.results.forEach(revokeResult);
      return { status: "idle" };
    });
    setDoc(null);
    setPages([]);
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
      setDoc({ name: file.name, bytes });
      setPages(initialPages(parsed.getPageCount()));
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
    let instructions: PageInstruction[];
    if (mode === "extract") {
      instructions = pages
        .filter((p) => p.selected)
        .map((p) => ({ sourceIndex: p.sourceIndex, rotate: p.rotate }));
      if (instructions.length === 0) {
        setState({ status: "error", error: toolError("PAGE_RANGE_INVALID") });
        return;
      }
    } else {
      instructions = pages.map((p) => ({ sourceIndex: p.sourceIndex, rotate: p.rotate }));
    }
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Building the new PDF…" },
    });
    try {
      const bytes = await organizePdf(doc.bytes, instructions);
      setState({
        status: "success",
        results: [
          makeResult(bytes, `${displayStem(doc.name)}-${config.suffix}.pdf`, "application/pdf"),
        ],
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
          hint="Pages appear as thumbnails you can work with. Recommended size under 50 MB."
        />
      ) : (
        <div>
          <p className="text-sm">
            <span className="font-medium">{doc.name}</span>{" "}
            <span className="text-fg-muted">
              · {pages.length} pages · {formatBytes(doc.bytes.length)}
            </span>
          </p>
          {mode === "rotate" ? (
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Rotate all pages">
              {([90, 180, 270] as const).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() =>
                    setPages((prev) =>
                      prev.map((p) => ({
                        ...p,
                        rotate: (((p.rotate + deg) % 360) as OrganizerPage["rotate"]),
                      })),
                    )
                  }
                  className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg"
                  style={{ borderColor: "var(--glass-strong-border)" }}
                >
                  All +{deg}°
                </button>
              ))}
            </div>
          ) : null}
          <PageOrganizer
            bytes={doc.bytes}
            capabilities={config.capabilities}
            pages={pages}
            onChange={setPages}
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={process}
              disabled={state.status === "processing" || pages.length === 0}
              className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              {config.action}
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
