"use client";

import { useCallback, useId, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint: string;
  disabled?: boolean;
}

/** Accessible drop zone that is also a normal file input. */
export function FileDrop({ accept, multiple, onFiles, label, hint, disabled }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputId = useId();

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-(--radius-md) border-2 border-dashed p-8 text-center transition-colors",
        dragOver
          ? "border-accent bg-accent-soft"
          : "border-(--glass-strong-border)",
        disabled && "opacity-50",
      )}
    >
      <UploadCloud className="mx-auto h-10 w-10 text-fg-subtle" aria-hidden="true" />
      <p className="mt-3 font-medium">{label}</p>
      <p className="mt-1 text-sm text-fg-muted">{hint}</p>
      <div className="mt-4">
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
        >
          Choose {multiple ? "files" : "a file"}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-3 text-xs text-fg-subtle">
        Processed on your device — not uploaded.
      </p>
    </div>
  );
}
