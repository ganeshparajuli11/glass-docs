"use client";

import { useId, type ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: (id: string) => ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {hint ? <p className="mt-1 text-xs text-fg-muted">{hint}</p> : null}
    </div>
  );
}

export const inputClass =
  "mt-1 w-full min-h-11 rounded-(--radius-sm) border bg-raised px-3 text-sm " +
  "border-(--glass-strong-border) focus:border-accent";

export const selectClass = inputClass;
