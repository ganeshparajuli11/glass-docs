"use client";

import { useId } from "react";
import { inputClass } from "./Field";

/**
 * Password input for the PDF security tools. Visibility is controlled by the
 * parent so one "Show passwords" switch can reveal every field at once.
 */
export function PasswordField({
  label,
  value,
  onChange,
  visible,
  autoComplete,
  hint,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  autoComplete: "new-password" | "current-password" | "off";
  hint?: string;
  invalid?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`${inputClass} font-mono`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={200}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? hintId : undefined}
      />
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function ShowPasswordsToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="h-5 w-5 shrink-0 accent-(--accent)"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      Show passwords
    </label>
  );
}
