"use client";

import { useCallback, useRef, useState } from "react";
import { FileDrop } from "@/components/tool/FileDrop";
import { FileList, type ListedFile } from "@/components/tool/FileList";
import { Field, selectClass } from "@/components/tool/Field";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { validateImageFile } from "@/lib/pdf/validation";
import { imagesToPdf, type ImageInput } from "@/lib/pdf/operations/images-to-pdf";
import { PdfOperationError } from "@/lib/pdf/operations/load";
import { makeResult, revokeResult } from "@/lib/files/download";
import { outputFileName } from "@/lib/files/format";

/**
 * Decodes via createImageBitmap (which honours EXIF orientation) and
 * re-encodes so WebP becomes PNG and rotated photos come out upright.
 */
async function normalizeImage(file: File): Promise<ImageInput> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const isJpeg = file.type === "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, isJpeg ? "image/jpeg" : "image/png", isJpeg ? 0.92 : undefined),
  );
  if (!blob) throw new Error("encode failed");
  return { kind: isJpeg ? "jpg" : "png", bytes: new Uint8Array(await blob.arrayBuffer()) };
}

export default function ImagesToPdfTool() {
  const [files, setFiles] = useState<ListedFile[]>([]);
  const [pageSize, setPageSize] = useState<"auto" | "a4" | "letter">("auto");
  const [fit, setFit] = useState<"contain" | "cover" | "original">("contain");
  const [margin, setMargin] = useState<"none" | "small" | "large">("small");
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
    for (const file of incoming) {
      const check = validateImageFile(file, { maxRecommendedSizeMb: 25 });
      if (!check.ok) {
        setState({ status: "error", error: check.error });
        return;
      }
    }
    setFiles((prev) => [
      ...prev,
      ...incoming.map((file) => ({ id: `i${(idCounter.current += 1)}`, file })),
    ]);
    setState({ status: "idle" });
  };

  const process = async () => {
    setState({
      status: "processing",
      progress: { stage: "parsing", fraction: 0, label: "Preparing images…" },
    });
    try {
      const inputs: ImageInput[] = [];
      for (let i = 0; i < files.length; i += 1) {
        inputs.push(await normalizeImage(files[i].file));
        setState({
          status: "processing",
          progress: {
            stage: "parsing",
            fraction: (i + 1) / (files.length + 1),
            label: `Preparing image ${i + 1} of ${files.length}…`,
          },
        });
      }
      const marginPt = margin === "none" ? 0 : margin === "small" ? 24 : 56;
      const bytes = await imagesToPdf(inputs, { pageSize, fit, marginPt });
      setState({
        status: "success",
        results: [makeResult(bytes, outputFileName("images", "pdf"), "application/pdf")],
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
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        onFiles={addFiles}
        label="Drop images here"
        hint="JPG, PNG, and WebP. Each image becomes one PDF page, in the order below."
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
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Page size">
              {(id) => (
                <select id={id} className={selectClass} value={pageSize} onChange={(e) => setPageSize(e.target.value as typeof pageSize)}>
                  <option value="auto">Auto (match image)</option>
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                </select>
              )}
            </Field>
            <Field label="Fit">
              {(id) => (
                <select id={id} className={selectClass} value={fit} onChange={(e) => setFit(e.target.value as typeof fit)}>
                  <option value="contain">Fit inside page</option>
                  <option value="cover">Fill page</option>
                  <option value="original">Original size</option>
                </select>
              )}
            </Field>
            <Field label="Margin">
              {(id) => (
                <select id={id} className={selectClass} value={margin} onChange={(e) => setMargin(e.target.value as typeof margin)}>
                  <option value="none">None</option>
                  <option value="small">Small</option>
                  <option value="large">Large</option>
                </select>
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
              Create PDF from {files.length} image{files.length === 1 ? "" : "s"}
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
        </>
      ) : null}
      {state.status === "processing" ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "error" ? <ErrorPanel error={state.error} onReset={() => setState({ status: "idle" })} /> : null}
    </div>
  );
}
