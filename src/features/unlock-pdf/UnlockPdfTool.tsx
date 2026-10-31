"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Info, KeyRound, LockOpen } from "lucide-react";
import { FileDrop } from "@/components/tool/FileDrop";
import { ErrorPanel, ProgressPanel, SuccessPanel } from "@/components/tool/Panels";
import { PasswordField, ShowPasswordsToggle } from "@/components/tool/PasswordField";
import type { ProgressState } from "@/lib/pdf/contracts";
import { toolError, type ToolError } from "@/lib/pdf/errors";
import { validatePdfBytes } from "@/lib/pdf/validation";
import {
  PdfSecurityError,
  describeEncryption,
  describeRestrictions,
  inspectPdf,
  unlockPdf,
  type EncryptionInfo,
} from "@/lib/pdf/security";
import { browserQpdfRunner } from "@/lib/pdf/qpdf-client";
import { fileToBytes, makeResult, revokeResult, type DownloadableResult } from "@/lib/files/download";
import { displayStem, formatBytes } from "@/lib/files/format";

/** What the file needs: an open password, or (opens freely) a permissions password. */
type Need =
  | { kind: "open-password" }
  | { kind: "permissions-password"; info: EncryptionInfo }
  | { kind: "none"; info: EncryptionInfo };

type State =
  | { status: "idle" }
  | { status: "processing"; progress: ProgressState }
  | { status: "done"; result: DownloadableResult; removed: string[] }
  | { status: "not-protected" }
  | { status: "error"; error: ToolError };

function asToolError(err: unknown): ToolError {
  if (err instanceof PdfSecurityError) return err.toolError;
  if (err instanceof RangeError) return toolError("MEMORY_LIMIT_REACHED");
  if (err instanceof Error && err.message === "BROWSER_UNSUPPORTED") return toolError("BROWSER_UNSUPPORTED");
  return toolError("UNKNOWN_PROCESSING_ERROR");
}

export default function UnlockPdfTool() {
  const [doc, setDoc] = useState<{ name: string; bytes: Uint8Array; need: Need } | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.status === "done") revokeResult(prev.result);
      return { status: "idle" };
    });
    setDoc(null);
    setPassword("");
    setInlineError(null);
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
      if (found.kind === "not-encrypted") {
        setState({ status: "not-protected" });
        return;
      }
      const need: Need =
        found.kind === "needs-password"
          ? { kind: "open-password" }
          : describeRestrictions(found.info.capabilities).length === 0
            ? { kind: "none", info: found.info }
            : { kind: "permissions-password", info: found.info };
      setDoc({ name: incoming[0].name, bytes, need });
      setState({ status: "idle" });
    } catch (err) {
      setState({ status: "error", error: asToolError(err) });
    }
  };

  const run = async () => {
    if (!doc) return;
    setInlineError(null);
    if (password.length === 0 && doc.need.kind !== "none") {
      setInlineError(
        doc.need.kind === "open-password" ? "Enter the PDF's password." : "Enter the permissions password.",
      );
      return;
    }
    setState({
      status: "processing",
      progress: { stage: "processing", fraction: null, label: "Removing protection…" },
    });
    try {
      const { bytes, before, hadOpenPassword } = await unlockPdf(browserQpdfRunner, doc.bytes, password);
      const removed: string[] = [];
      if (hadOpenPassword) removed.push("the open password");
      const restrictions = describeRestrictions(before.capabilities);
      if (restrictions.length > 0) removed.push(`restrictions on ${restrictions.join(", ").toLowerCase()}`);
      removed.push(`${describeEncryption(before)} encryption`);
      setPassword("");
      setState({
        status: "done",
        result: makeResult(bytes, `${displayStem(doc.name)}-unlocked.pdf`, "application/pdf"),
        removed,
      });
    } catch (err) {
      if (
        err instanceof PdfSecurityError &&
        (err.code === "WRONG_PASSWORD" || err.code === "NEEDS_PERMISSIONS_PASSWORD")
      ) {
        setInlineError(`${err.toolError.message} ${err.toolError.recovery ?? ""}`.trim());
        setState({ status: "idle" });
        return;
      }
      setState({ status: "error", error: asToolError(err) });
    }
  };

  if (state.status === "done") {
    return (
      <div>
        <SuccessPanel
          results={[state.result]}
          note={`Removed ${state.removed.join(", ")}. The unlocked copy opens without a password, so store and share it with care.`}
          onReset={reset}
        />
        <p className="mt-3 text-sm text-fg-muted">
          Next steps: combine it with other files in <Link href="/tools/merge-pdf">Merge PDF</Link>, shrink it with{" "}
          <Link href="/tools/compress-pdf">Compress PDF</Link>, or add a new password of your own with{" "}
          <Link href="/tools/protect-pdf">Protect PDF</Link>.
        </p>
      </div>
    );
  }

  const busy = state.status === "processing";

  return (
    <div>
      {!doc ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFiles={onFiles}
          disabled={busy}
          label="Drop a protected PDF here"
          hint="You will need its password. The file and password stay on your device."
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
            <span className="text-fg-muted">· {formatBytes(doc.bytes.length)}</span>
          </p>
          {doc.need.kind === "open-password" ? (
            <p className="mt-3 flex gap-2 text-sm">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              This PDF needs a password to open. Enter it below — the open password or the permissions (owner) password
              both work.
            </p>
          ) : doc.need.kind === "none" ? (
            <p className="mt-3 flex gap-2 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              This PDF is encrypted ({describeEncryption(doc.need.info)}) but opens without a password and restricts
              nothing, so no password is needed. Unlocking saves a plain copy that other PDF tools can edit.
            </p>
          ) : (
            <div
              className="mt-3 rounded-(--radius-sm) border p-3 text-sm"
              style={{ borderColor: "var(--glass-strong-border)" }}
            >
              <p className="flex gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  This PDF opens without a password, but its author restricted it ({describeEncryption(doc.need.info)}).
                  It blocks:
                </span>
              </p>
              <ul className="mt-2 list-disc pl-10">
                {describeRestrictions(doc.need.info.capabilities).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p className="mt-2 text-fg-muted">
                Removing the restrictions needs the permissions (owner) password. Without it, ask the sender for an
                unrestricted copy.
              </p>
            </div>
          )}

          {doc.need.kind !== "none" ? (
            <>
              <div className="mt-4 sm:max-w-sm">
                <PasswordField
                  label={doc.need.kind === "open-password" ? "PDF password" : "Permissions password"}
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    setInlineError(null);
                  }}
                  visible={show}
                  autoComplete="off"
                  invalid={inlineError !== null}
                />
              </div>
              <div className="mt-2">
                <ShowPasswordsToggle checked={show} onChange={setShow} />
              </div>
            </>
          ) : null}
          {inlineError ? (
            <p role="alert" className="mt-2 text-sm text-error">
              {inlineError}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
            >
              <LockOpen className="h-4 w-4" aria-hidden="true" /> Unlock PDF
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
      {state.status === "not-protected" ? (
        <div role="status" className="mt-6 rounded-(--radius-md) p-4" style={{ background: "var(--accent-soft)" }}>
          <p className="flex items-center gap-2 font-medium">
            <LockOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
            This PDF has no password or restrictions — there is nothing to unlock.
          </p>
          <p className="mt-2 text-sm text-fg-muted">
            It already works in every tool on this site. Want to add a password instead? Use{" "}
            <Link href="/tools/protect-pdf">Protect PDF</Link>.
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
