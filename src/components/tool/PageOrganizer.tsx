"use client";

/**
 * Shared page-organizer foundation for rotate / reorder / delete / extract.
 * Thumbnails render progressively; documents beyond the thumbnail budget
 * fall back to a compact list without previews.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Trash2 } from "lucide-react";
import { destroyDocument, openDocument, renderPageToCanvas } from "@/lib/pdf/pdfjs";
import { cn } from "@/lib/utils";

const THUMBNAIL_BUDGET = 120;
const THUMB_SCALE = 0.28;

export interface OrganizerPage {
  /** Zero-based index in the source document. */
  sourceIndex: number;
  /** Extra rotation applied by the user. */
  rotate: 0 | 90 | 180 | 270;
  selected: boolean;
  thumb?: string;
}

export interface OrganizerCapabilities {
  select?: boolean;
  reorder?: boolean;
  rotate?: boolean;
  delete?: boolean;
}

interface PageOrganizerProps {
  bytes: Uint8Array;
  capabilities: OrganizerCapabilities;
  pages: OrganizerPage[];
  onChange: (pages: OrganizerPage[]) => void;
}

export function initialPages(pageCount: number): OrganizerPage[] {
  return Array.from({ length: pageCount }, (_, i) => ({
    sourceIndex: i,
    rotate: 0,
    selected: false,
  }));
}

export function PageOrganizer({ bytes, capabilities, pages, onChange }: PageOrganizerProps) {
  const [thumbs, setThumbs] = useState<Map<number, string>>(new Map());
  const [thumbsDone, setThumbsDone] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    let doc: Awaited<ReturnType<typeof openDocument>> | null = null;
    (async () => {
      try {
        doc = await openDocument(bytes);
        const budget = Math.min(doc.numPages, THUMBNAIL_BUDGET);
        for (let p = 1; p <= budget; p += 1) {
          if (cancelled.current) return;
          const rendered = await renderPageToCanvas(doc, p, THUMB_SCALE);
          const url = rendered.canvas.toDataURL("image/jpeg", 0.7);
          setThumbs((prev) => new Map(prev).set(p - 1, url));
        }
      } catch {
        // Thumbnails are progressive enhancement; the list still works.
      } finally {
        setThumbsDone(true);
        if (doc) void destroyDocument(doc);
      }
    })();
    return () => {
      cancelled.current = true;
    };
  }, [bytes]);

  const update = (index: number, patch: Partial<OrganizerPage>) => {
    onChange(pages.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    const next = pages.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const bulkSelect = (mode: "all" | "none" | "odd" | "even") => {
    onChange(
      pages.map((p, i) => ({
        ...p,
        selected:
          mode === "all" ? true : mode === "none" ? false : mode === "odd" ? i % 2 === 0 : i % 2 === 1,
      })),
    );
  };

  return (
    <div>
      {capabilities.select ? (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Bulk page selection">
          {(
            [
              ["all", "Select all"],
              ["none", "Clear"],
              ["odd", "Odd"],
              ["even", "Even"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => bulkSelect(mode)}
              className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted hover:text-fg"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              {label}
            </button>
          ))}
          <span className="text-sm text-fg-muted" aria-live="polite">
            {pages.filter((p) => p.selected).length} of {pages.length} selected
          </span>
        </div>
      ) : null}

      <ul
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        aria-label="Document pages"
      >
        {pages.map((page, index) => {
          const thumb = thumbs.get(page.sourceIndex);
          return (
            <li
              key={`${page.sourceIndex}-${index}`}
              className={cn(
                "rounded-(--radius-sm) border p-2 text-center",
                page.selected && "ring-2 ring-(--focus-ring)",
              )}
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              <div
                className="mx-auto flex h-28 items-center justify-center overflow-hidden rounded bg-raised"
                aria-hidden="true"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="max-h-full max-w-full transition-transform"
                    style={{ transform: `rotate(${page.rotate}deg)` }}
                  />
                ) : (
                  <span className="text-xs text-fg-subtle">
                    {thumbsDone ? "No preview" : "Loading…"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                Page {page.sourceIndex + 1}
                {page.rotate !== 0 ? ` · ${page.rotate}°` : ""}
              </p>
              <div className="mt-1 flex items-center justify-center gap-0.5">
                {capabilities.select ? (
                  <input
                    type="checkbox"
                    aria-label={`Select page ${page.sourceIndex + 1}`}
                    checked={page.selected}
                    onChange={(e) => update(index, { selected: e.target.checked })}
                    className="h-5 w-5 accent-(--accent)"
                  />
                ) : null}
                {capabilities.rotate ? (
                  <button
                    type="button"
                    aria-label={`Rotate page ${page.sourceIndex + 1}`}
                    onClick={() =>
                      update(index, { rotate: ((page.rotate + 90) % 360) as OrganizerPage["rotate"] })
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft"
                  >
                    <RotateCw className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
                {capabilities.reorder ? (
                  <>
                    <button
                      type="button"
                      aria-label={`Move page ${page.sourceIndex + 1} earlier`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move page ${page.sourceIndex + 1} later`}
                      disabled={index === pages.length - 1}
                      onClick={() => move(index, 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : null}
                {capabilities.delete ? (
                  <button
                    type="button"
                    aria-label={`Delete page ${page.sourceIndex + 1}`}
                    disabled={pages.length <= 1}
                    onClick={() => onChange(pages.filter((_, i) => i !== index))}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted hover:bg-error-soft hover:text-error disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
