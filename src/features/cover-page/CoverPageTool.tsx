"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/tool/Field";
import { ErrorPanel, SuccessPanel } from "@/components/tool/Panels";
import type { ToolState } from "@/lib/pdf/contracts";
import { toolError } from "@/lib/pdf/errors";
import { generateCoverPage } from "@/lib/pdf/operations/cover-page";
import { PdfOperationError } from "@/lib/pdf/operations/load";
import { makeResult, revokeResult } from "@/lib/files/download";

const FIELDS = [
  ["institution", "Institution", "e.g. University of Greenwich"],
  ["assignmentTitle", "Assignment title *", "e.g. Managing Across Cultures — Case Analysis"],
  ["module", "Module / course", "e.g. INDU1033"],
  ["studentName", "Student name *", ""],
  ["studentId", "Student ID", ""],
  ["tutor", "Tutor / lecturer", ""],
  ["submissionDate", "Submission date", "e.g. 1 August 2026"],
  ["wordCount", "Word count", "e.g. 2,500"],
] as const;

type FieldKey = (typeof FIELDS)[number][0];

export default function CoverPageTool() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    institution: "",
    assignmentTitle: "",
    module: "",
    studentName: "",
    studentId: "",
    tutor: "",
    submissionDate: "",
    wordCount: "",
  });
  const [state, setState] = useState<ToolState>({ status: "idle" });

  const reset = () => {
    setState((prev) => {
      if (prev.status === "success") prev.results.forEach(revokeResult);
      return { status: "idle" };
    });
  };

  const generate = async () => {
    try {
      const bytes = await generateCoverPage(values);
      setState({
        status: "success",
        results: [makeResult(bytes, "cover-page.pdf", "application/pdf")],
        note: "Merge it in front of your assignment with the Merge PDF tool.",
      });
    } catch (err) {
      setState({
        status: "error",
        error:
          err instanceof PdfOperationError
            ? err.toolError
            : {
                code: "UNKNOWN_PROCESSING_ERROR",
                message: "Check the fields — title and student name are required (Latin characters for now).",
              },
      });
    }
  };

  if (state.status === "success") {
    return <SuccessPanel results={state.results} note={state.note} onReset={reset} />;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(([key, label, placeholder]) => (
          <Field key={key} label={label}>
            {(id) => (
              <input
                id={id}
                className={inputClass}
                value={values[key]}
                placeholder={placeholder}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            )}
          </Field>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generate}
          disabled={values.assignmentTitle.trim() === "" || values.studentName.trim() === ""}
          className="min-h-11 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
        >
          Generate cover page PDF
        </button>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">
        Generated on your device as a clean A4 page. Check your course’s required
        cover format — some modules provide an official template you must use.
      </p>
      {state.status === "error" ? <ErrorPanel error={state.error} onReset={reset} /> : null}
    </div>
  );
}
