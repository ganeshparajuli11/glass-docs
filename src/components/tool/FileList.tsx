"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { formatBytes } from "@/lib/files/format";

export interface ListedFile {
  id: string;
  file: File;
  /** Page count if already parsed. */
  pageCount?: number;
}

interface FileListProps {
  files: ListedFile[];
  onMove?: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  reorderable?: boolean;
}

export function FileList({ files, onMove, onRemove, reorderable }: FileListProps) {
  return (
    <ul className="mt-4 space-y-2" aria-label="Selected files">
      {files.map((f, i) => (
        <li
          key={f.id}
          className="flex items-center justify-between gap-3 rounded-(--radius-sm) border px-3 py-2"
          style={{ borderColor: "var(--glass-strong-border)" }}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{f.file.name}</p>
            <p className="text-xs text-fg-muted">
              {formatBytes(f.file.size)}
              {f.pageCount !== undefined ? ` · ${f.pageCount} pages` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {reorderable ? (
              <>
                <button
                  type="button"
                  aria-label={`Move ${f.file.name} up`}
                  disabled={i === 0}
                  onClick={() => onMove?.(i, -1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${f.file.name} down`}
                  disabled={i === files.length - 1}
                  onClick={() => onMove?.(i, 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-accent-soft disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : null}
            <button
              type="button"
              aria-label={`Remove ${f.file.name}`}
              onClick={() => onRemove(i)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-error-soft hover:text-error"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
