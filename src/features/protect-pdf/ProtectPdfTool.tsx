"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Lock } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import { PasswordField, ShowPasswordsToggle } from "@/components/tool/PasswordField";
import type { ProgressState } from "@/lib/pdf/contracts";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import {
  PdfSecurityError,
  describeRestrictions,
  hasRestrictions,
  inspectPdf,
  protectPdf,
  validateProtectInput,
  type Permissions,
} from "@/lib/pdf/security";
import { browserQpdfRunner } from "@/lib/pdf/qpdf-client";
import { fileToBytes, makeResult, revokeResult, type DownloadableResult } from "@/lib/files/download";
import { displayStem, formatBytes } from "@/lib/files/format";

type State =
  | { status: "idle" }
  | { status: "processing"; progress: ProgressState }
  | { status: "done"; result: DownloadableResult; summary: string[] }
  | { status: "already-protected" }
  | { status: "error"; error: ToolError };

const permissionLabels: Array<{ key: keyof Permissions; label: string; hint: string }> = [
  { key: "print", label: "Allow printing", hint: "Untick to block printing in readers that honour restrictions." },
  {
    key: "copy",
    label: "Allow copying text and images",
    hint: "Untick to block select-and-copy. Screen readers still work.",
  },
  { key: "edit", label: "Allow editing", hint: "Untick to block changing pages, content, comments and form fields." },
];

function asToolError(err: unknown): ToolError {
  if (err instanceof PdfSecurityError) return err.toolError;
  if (err instanceof RangeError) return toolError("MEMORY_LIMIT_REACHED");
  if (err instanceof Error && err.message === "BROWSER_UNSUPPORTED") return toolError("BROWSER_UNSUPPORTED");
  return toolError("UNKNOWN_PROCESSING_ERROR");
}

export default function ProtectPdfTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [requireOpen, setRequireOpen] = useState(true);
  const [openPassword, setOpenPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [permissions, setPermissions] = useState<Permissions>({ print: true, copy: true, edit: true });
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState<State>({ status: "idle" });

  const restricted = hasRestrictions(permissions);
  const validation = validateProtectInput({
    requireOpenPassword: requireOpen,
    openPassword: requireOpen ? openPassword : "",
    confirmOpenPassword: requireOpen ? confirm : "",
    permissionsPassword: ownerPassword,
    permissions,
  });

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "done") revokeResult(prev.result);
      return { status: "idle" };
    });
    setDoc(null);
    setOpenPassword("");
    setConfirm("");
    setOwnerPassword("");
    setSubmitted(false);
  }, []);

  const onFiles = async (incoming: File[]) => {
    const bytes = await fileToBytes(incoming[0]);
    const check = validatePdfBytes(bytes, { maxRecommendedSizeMb: 100 });
    if (!check.ok) {
      setState({ status: "error", error: check.error });
      return;
    }
    setState({ status: "processing", progress: { stage: "parsing", fraction: null, label: "Checking the PDF…" } });
    try {
      const found = await inspectPdf(browserQpdfRunner, bytes);
      if (found.kind !== "not-encrypted") {
        setState({ status: "already-protected" });
        return;
      }
      setDoc({ name: incoming[0].name, bytes });
      setState({ status: "idle" });
    } catch (err) {
      setState({ status: "error", error: asToolError(err) });
    }
  };

  const run = async () => {
    if (!doc) return;
    setSubmitted(true);
    if (validation.errors.length > 0) return;
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Encrypting with AES-256…" },
    });
    try {
      const { bytes } = await protectPdf(browserQpdfRunner, doc.bytes, {
        openPassword: requireOpen ? openPassword : "",
        permissionsPassword: restricted ? ownerPassword : "",
        permissions,
      });
      const summary = [requireOpen ? "Opening the file needs the password you chose." : "Anyone can open the file."];
      const blocked = describeRestrictions({
        accessibility: true,
        extract: permissions.copy,
        modify: permissions.edit,
        modifyannotations: permissions.edit,
        modifyassembly: permissions.edit,
        modifyforms: permissions.edit,
        modifyother: permissions.edit,
        printhigh: permissions.print,
        printlow: permissions.print,
      });
      if (blocked.length > 0)
        summary.push(`Restricted without the permissions password: ${blocked.join(", ").toLowerCase()}.`);
      summary.push("Encryption: AES-256. Keep the password safe — it cannot be recovered.");
      setOpenPassword("");
      setConfirm("");
      setOwnerPassword("");
      setSubmitted(false);
      setState({
        status: "done",
        result: makeResult(bytes, `${displayStem(doc.name)}-protected.pdf`, "application/pdf"),
        summary,
      });
    } catch (err) {
      setState({ status: "error", error: asToolError(err) });
    }
  };

  if (state.status === "done") {
    return (
      <div>
        <SuccessPanel results={[state.result]} note={state.summary.join(" ")} onReset={reset} />
        <p className="mt-3 text-sm text-fg-muted">
          Open the download once and type the password to check it before you delete your original. Need to change the
          password later? Use <Link href="/tools/unlock-pdf">Unlock PDF</Link>, then protect the unlocked copy again.
        </p>
      </div>
    );
  }

  const busy = state.status === "processing";
  const showErrors = submitted && validation.errors.length > 0;

  return (
    <div>
      {!doc ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          disabled={busy}
          label="Drop a PDF here"
          hint="The PDF is encrypted on your device. Neither the file nor the password is uploaded."
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
          noValidate
        >
          <p className="break-anywhere text-sm">
            <span className="font-medium">{doc.name}</span>{" "}
            <span className="text-fg-muted">· {formatBytes(doc.bytes.length)} · not protected yet</span>
          </p>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Open password</legend>
            <label className="mt-2 flex min-h-11 cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 accent-(--accent)"
                checked={requireOpen}
                onChange={(e) => setRequireOpen(e.target.checked)}
              />
              <span>
                <span className="font-medium">Require a password to open the PDF</span>
                <span className="block text-xs text-fg-muted">
                  This is the real protection: without the password the contents cannot be read.
                </span>
              </span>
            </label>
            {requireOpen ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <PasswordField
                  label="Password"
                  value={openPassword}
                  onChange={setOpenPassword}
                  visible={show}
                  autoComplete="new-password"
                  invalid={submitted && openPassword.length === 0}
                />
                <PasswordField
                  label="Type it again"
                  value={confirm}
                  onChange={setConfirm}
                  visible={show}
                  autoComplete="new-password"
                  invalid={submitted && confirm !== openPassword}
                />
              </div>
            ) : null}
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Restrictions (optional)</legend>
            <p className="mt-1 text-xs text-fg-muted">
              Readers such as Adobe Acrobat and browser PDF viewers respect these, but they are a request, not a lock:
              anyone who can open the file can read it.
            </p>
            <div className="mt-2 grid gap-1">
              {permissionLabels.map(({ key, label, hint }) => (
                <label key={key} className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-(--accent)"
                    checked={permissions[key]}
                    onChange={(e) => setPermissions((p) => ({ ...p, [key]: e.target.checked }))}
                  />
                  <span>
                    <span className="font-medium">{label}</span>
                    <span className="block text-xs text-fg-muted">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {restricted ? (
              <div className="mt-3 sm:max-w-sm">
                <PasswordField
                  label="Permissions password"
                  value={ownerPassword}
                  onChange={setOwnerPassword}
                  visible={show}
                  autoComplete="new-password"
                  hint="Needed to lift the restrictions later. Must differ from the open password."
                  invalid={submitted && ownerPassword.length === 0}
                />
              </div>
            ) : null}
          </fieldset>

          <div className="mt-3">
            <ShowPasswordsToggle checked={show} onChange={setShow} />
          </div>

          {validation.warnings.length > 0 ? (
            <p className="mt-3 flex gap-2 text-sm text-fg-muted">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              {validation.warnings[0]}
            </p>
          ) : null}
          {showErrors ? (
            <ul role="alert" className="mt-3 list-disc space-y-1 pl-5 text-sm text-error">
              {validation.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              <Lock className="h-4 w-4" aria-hidden="true" /> Protect PDF
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="min-h-11 rounded-full border px-4 text-sm font-medium text-fg-muted disabled:opacity-40"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              Choose another file
            </button>
          </div>
        </form>
      )}

      {busy ? <ProgressPanel progress={state.progress} /> : null}
      {state.status === "already-protected" ? (
        <div role="alert" className="mt-6 rounded-(--radius-md) p-4" style={{ background: "var(--accent-soft)" }}>
          <p className="flex items-center gap-2 font-medium">
            <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
            This PDF is already password-protected.
          </p>
          <p className="mt-2 text-sm text-fg-muted">
            To change its password or restrictions, remove the current protection with{" "}
            <Link href="/tools/unlock-pdf">Unlock PDF</Link> (you will need the current password), then protect the
            unlocked copy here.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 min-h-11 rounded-full border px-4 text-sm font-medium"
            style={{ borderColor: "var(--glass-strong-border)" }}
          >
            Choose another file
          </button>
        </div>
      ) : null}
      {state.status === "error" ? (
        <ErrorPanel error={state.error} onReset={() => (doc ? setState({ status: "idle" }) : reset())} />
      ) : null}
    </div>
  );
}
