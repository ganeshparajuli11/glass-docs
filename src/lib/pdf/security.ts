/**
 * Password protection for PDFs: add an open password and/or permission
 * restrictions (Protect PDF), or remove protection when the password is known
 * (Unlock PDF).
 *
 * The cryptography is done by qpdf (Apache-2.0, compiled to WebAssembly),
 * never by hand-written code here. This module is pure: it builds qpdf
 * command lines, interprets qpdf's JSON and error output, and enforces the
 * rules below. The qpdf runner is injected, so the same logic runs against
 * the browser worker (src/lib/pdf/qpdf-client.ts) and against qpdf in Node
 * in the integration tests.
 *
 * Rules:
 * - New protection always uses AES-256 (PDF 2.0 / revision 6).
 * - Unlocking needs a real password. A PDF that opens without one but carries
 *   restrictions can only be unlocked with its permissions (owner) password:
 *   this tool never works around restrictions a document's author set.
 * - Every output is re-inspected before it is handed over.
 */
import type { ToolError } from "./errors";

export const QPDF_INPUT = "/in.pdf";
export const QPDF_OUTPUT = "/out.pdf";

/** AES-256 (R6) passwords are truncated by readers after 127 UTF-8 bytes. */
export const MAX_PASSWORD_BYTES = 127;
/** Shorter open passwords are allowed but get a warning. */
export const RECOMMENDED_PASSWORD_LENGTH = 8;

export interface QpdfRun {
  /** qpdf exit code: 0 success, 2 error, 3 success with warnings. */
  code: number;
  stdout: string;
  stderr: string;
  output: Uint8Array | null;
}

export type QpdfRunner = (input: Uint8Array, args: string[], wantOutput: boolean) => Promise<QpdfRun>;

export interface Permissions {
  print: boolean;
  copy: boolean;
  edit: boolean;
}

export const ALL_ALLOWED: Permissions = { print: true, copy: true, edit: true };

export interface ProtectOptions {
  /** Password needed to open the file. Empty = anyone can open it. */
  openPassword: string;
  /** Password needed to change restrictions. Required when anything is restricted. */
  permissionsPassword: string;
  permissions: Permissions;
}

export interface Capabilities {
  accessibility: boolean;
  extract: boolean;
  modify: boolean;
  modifyannotations: boolean;
  modifyassembly: boolean;
  modifyforms: boolean;
  modifyother: boolean;
  printhigh: boolean;
  printlow: boolean;
}

export interface EncryptionInfo {
  encrypted: boolean;
  userPasswordMatched: boolean;
  ownerPasswordMatched: boolean;
  capabilities: Capabilities;
  /** Revision of the standard security handler (2–6), null if not encrypted. */
  revision: number | null;
  bits: number | null;
  method: string | null;
}

export type SecurityErrorCode =
  | "WRONG_PASSWORD"
  | "NEEDS_PERMISSIONS_PASSWORD"
  | "ALREADY_PROTECTED"
  | "NOT_PROTECTED"
  | "DAMAGED"
  | "UNSUPPORTED_SECURITY"
  | "FAILED";

const errorText: Record<SecurityErrorCode, { message: string; recovery: string; code: ToolError["code"] }> = {
  WRONG_PASSWORD: {
    code: "PDF_ENCRYPTED_UNSUPPORTED",
    message: "That password is not correct for this PDF.",
    recovery:
      "Passwords are case-sensitive. Check Caps Lock and the keyboard language, and look for a space at the start or end.",
  },
  NEEDS_PERMISSIONS_PASSWORD: {
    code: "PDF_ENCRYPTED_UNSUPPORTED",
    message: "This PDF opens without a password but its author restricted it with a permissions password.",
    recovery:
      "Enter the permissions (owner) password to remove the restrictions. Without it, ask the person who sent the file for an unrestricted copy.",
  },
  ALREADY_PROTECTED: {
    code: "PDF_ENCRYPTED_UNSUPPORTED",
    message: "This PDF is already password-protected.",
    recovery:
      "Remove the current protection with Unlock PDF first, then protect the unlocked copy with a new password.",
  },
  NOT_PROTECTED: {
    code: "PDF_INVALID",
    message: "This PDF has no password or restrictions, so there is nothing to unlock.",
    recovery: "It already opens and edits normally in any PDF tool.",
  },
  DAMAGED: {
    code: "PDF_PARSE_FAILED",
    message: "The PDF could not be read. It may be damaged or incomplete.",
    recovery: "Check that the file opens in a PDF reader. If it was downloaded, download it again.",
  },
  UNSUPPORTED_SECURITY: {
    code: "PDF_ENCRYPTED_UNSUPPORTED",
    message: "This PDF uses a kind of protection this tool cannot open, such as certificate-based encryption.",
    recovery:
      "Open it in the software it was meant for (often Adobe Acrobat with the right certificate) and save an unprotected copy there.",
  },
  FAILED: {
    code: "OUTPUT_FAILED",
    message: "The new file could not be created.",
    recovery: "Try again. If it keeps failing, the PDF may use features this tool cannot rewrite.",
  },
};

export class PdfSecurityError extends Error {
  readonly code: SecurityErrorCode;
  readonly toolError: ToolError;
  constructor(code: SecurityErrorCode) {
    super(errorText[code].message);
    this.name = "PdfSecurityError";
    this.code = code;
    const { code: toolCode, message, recovery } = errorText[code];
    this.toolError = { code: toolCode, message, recovery };
  }
}

export function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Forms of a typed password worth trying. AES-256 PDFs are meant to use
 * SASLprep (NFKC) normalised passwords, so a composed/decomposed accent typed
 * on another device still matches.
 */
export function passwordCandidates(password: string): string[] {
  const normalised = password.normalize("NFKC");
  return normalised === password ? [password] : [password, normalised];
}

export interface ProtectFormInput extends ProtectOptions {
  requireOpenPassword: boolean;
  confirmOpenPassword: string;
}

export interface ProtectValidation {
  errors: string[];
  warnings: string[];
}

export function hasRestrictions(p: Permissions): boolean {
  return !p.print || !p.copy || !p.edit;
}

/** Checks the Protect PDF form; errors block, warnings only inform. */
export function validateProtectInput(input: ProtectFormInput): ProtectValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const restricted = hasRestrictions(input.permissions);

  if (input.requireOpenPassword) {
    if (input.openPassword.length === 0) {
      errors.push("Enter a password to open the PDF.");
    } else {
      if (input.openPassword !== input.confirmOpenPassword) {
        errors.push("The two passwords do not match.");
      }
      if (utf8Length(input.openPassword.normalize("NFKC")) > MAX_PASSWORD_BYTES) {
        errors.push(`The password is too long — PDF readers only use the first ${MAX_PASSWORD_BYTES} bytes.`);
      }
      if ([...input.openPassword].length < RECOMMENDED_PASSWORD_LENGTH) {
        warnings.push(
          `Short passwords can be guessed by software that tries millions of combinations. Use at least ${RECOMMENDED_PASSWORD_LENGTH} characters for anything sensitive.`,
        );
      }
    }
  } else if (!restricted) {
    errors.push("Turn on the open password or restrict at least one action — otherwise there is nothing to protect.");
  }

  if (restricted) {
    if (input.permissionsPassword.length === 0) {
      errors.push("Restrictions need a permissions password, so that only you can lift them.");
    } else {
      if (input.requireOpenPassword && input.permissionsPassword === input.openPassword) {
        errors.push(
          "Use a different permissions password. Anyone who opens the file with the same password would get full rights and the restrictions would do nothing.",
        );
      }
      if (utf8Length(input.permissionsPassword.normalize("NFKC")) > MAX_PASSWORD_BYTES) {
        errors.push(`The permissions password is too long (maximum ${MAX_PASSWORD_BYTES} bytes).`);
      }
    }
  }
  return { errors, warnings };
}

/**
 * qpdf command line for AES-256 protection.
 * With no restrictions the permissions password equals the open password, so
 * whoever can open the file has full rights (there is nothing to restrict).
 */
export function buildProtectArgs(opts: ProtectOptions): string[] {
  const user = opts.openPassword.normalize("NFKC");
  const restricted = hasRestrictions(opts.permissions);
  const owner = restricted ? opts.permissionsPassword.normalize("NFKC") : user;
  const args = ["--encrypt", `--user-password=${user}`, `--owner-password=${owner}`, "--bits=256"];
  if (!opts.permissions.print) args.push("--print=none");
  if (!opts.permissions.copy) args.push("--extract=n");
  if (!opts.permissions.edit) args.push("--modify=none");
  args.push("--", QPDF_INPUT, QPDF_OUTPUT);
  return args;
}

export function buildInspectArgs(password?: string): string[] {
  const args = password === undefined ? [] : [`--password=${password}`];
  return [...args, "--json=2", "--json-key=encrypt", QPDF_INPUT];
}

export function buildUnlockArgs(password: string): string[] {
  return [`--password=${password}`, "--decrypt", QPDF_INPUT, QPDF_OUTPUT];
}

const NO_CAPS: Capabilities = {
  accessibility: true,
  extract: true,
  modify: true,
  modifyannotations: true,
  modifyassembly: true,
  modifyforms: true,
  modifyother: true,
  printhigh: true,
  printlow: true,
};

/** Parses `qpdf --json=2 --json-key=encrypt` output. Returns null if it is not that JSON. */
export function parseEncryptJson(stdout: string): EncryptionInfo | null {
  let data: unknown;
  try {
    data = JSON.parse(stdout);
  } catch {
    return null;
  }
  const enc = (data as { encrypt?: Record<string, unknown> } | null)?.encrypt;
  if (!enc || typeof enc !== "object" || typeof enc.encrypted !== "boolean") return null;
  const capsIn = (enc.capabilities ?? {}) as Partial<Record<keyof Capabilities, unknown>>;
  const capabilities = { ...NO_CAPS };
  for (const key of Object.keys(NO_CAPS) as Array<keyof Capabilities>) {
    if (typeof capsIn[key] === "boolean") capabilities[key] = capsIn[key] as boolean;
  }
  const params = (enc.parameters ?? {}) as Record<string, unknown>;
  const encrypted = enc.encrypted;
  return {
    encrypted,
    userPasswordMatched: enc.userpasswordmatched === true,
    ownerPasswordMatched: enc.ownerpasswordmatched === true,
    capabilities: encrypted ? capabilities : { ...NO_CAPS },
    revision: encrypted && typeof params.R === "number" ? params.R : null,
    bits: encrypted && typeof params.bits === "number" ? params.bits : null,
    method: encrypted && typeof params.method === "string" ? params.method : null,
  };
}

/** Plain-language list of what a protected PDF does not allow. */
export function describeRestrictions(c: Capabilities): string[] {
  const out: string[] = [];
  if (!c.printlow && !c.printhigh) out.push("Printing");
  else if (!c.printhigh) out.push("High-quality printing (low-resolution only)");
  if (!c.extract) out.push("Copying text and images");
  if (!c.modifyother) out.push("Editing the content");
  if (!c.modifyassembly) out.push("Adding, deleting or rotating pages");
  if (!c.modifyannotations) out.push("Adding comments");
  if (!c.modifyforms) out.push("Filling in forms");
  return out;
}

/** Human name for the encryption in use, e.g. "AES-256". */
export function describeEncryption(info: Pick<EncryptionInfo, "method" | "bits">): string {
  const method = (info.method ?? "").toUpperCase();
  if (method.startsWith("AESV3")) return "AES-256";
  if (method.startsWith("AESV2")) return "AES-128";
  if (method.startsWith("RC4")) return info.bits ? `RC4 ${info.bits}-bit (outdated)` : "RC4 (outdated)";
  if (method === "NONE") return "None";
  return info.bits ? `${info.bits}-bit` : "Unknown";
}

export type FailureKind = "wrong-password" | "damaged" | "unsupported" | "other";

export function classifyQpdfFailure(stderr: string): FailureKind {
  const s = stderr.toLowerCase();
  if (s.includes("invalid password")) return "wrong-password";
  if (s.includes("unsupported") && (s.includes("filter") || s.includes("encryption") || s.includes("key length"))) {
    return "unsupported";
  }
  if (
    s.includes("can't find pdf header") ||
    s.includes("can't find startxref") ||
    s.includes("not a pdf file") ||
    s.includes("unable to find trailer") ||
    s.includes("unable to find /root") ||
    s.includes("file is damaged") ||
    s.includes("no such file")
  ) {
    return "damaged";
  }
  return "other";
}

export type InspectResult =
  { kind: "not-encrypted" } | { kind: "needs-password" } | { kind: "opened"; info: EncryptionInfo; password: string };

const ok = (run: QpdfRun) => run.code === 0 || run.code === 3;

function failureError(stderr: string): PdfSecurityError {
  const kind = classifyQpdfFailure(stderr);
  if (kind === "damaged") return new PdfSecurityError("DAMAGED");
  if (kind === "unsupported") return new PdfSecurityError("UNSUPPORTED_SECURITY");
  if (kind === "wrong-password") return new PdfSecurityError("WRONG_PASSWORD");
  return new PdfSecurityError("FAILED");
}

/**
 * Reads a PDF's protection. With no password it reports whether one is
 * needed to open the file; with a password it tries each normalised form.
 */
export async function inspectPdf(run: QpdfRunner, bytes: Uint8Array, password?: string): Promise<InspectResult> {
  const candidates = password === undefined ? [undefined] : passwordCandidates(password);
  let sawWrongPassword = false;
  for (const candidate of candidates) {
    const result = await run(bytes, buildInspectArgs(candidate), false);
    if (ok(result)) {
      const info = parseEncryptJson(result.stdout);
      if (!info) throw new PdfSecurityError("DAMAGED");
      if (!info.encrypted) return { kind: "not-encrypted" };
      return { kind: "opened", info, password: candidate ?? "" };
    }
    const failure = classifyQpdfFailure(result.stderr);
    if (failure === "wrong-password") {
      sawWrongPassword = true;
      continue;
    }
    throw new PdfSecurityError(failure === "unsupported" ? "UNSUPPORTED_SECURITY" : "DAMAGED");
  }
  if (sawWrongPassword) return { kind: "needs-password" };
  throw new PdfSecurityError("DAMAGED");
}

export interface ProtectResult {
  bytes: Uint8Array;
  info: EncryptionInfo;
}

export async function protectPdf(run: QpdfRunner, bytes: Uint8Array, opts: ProtectOptions): Promise<ProtectResult> {
  const before = await inspectPdf(run, bytes);
  if (before.kind !== "not-encrypted") throw new PdfSecurityError("ALREADY_PROTECTED");

  const result = await run(bytes, buildProtectArgs(opts), true);
  if (!ok(result) || !result.output || result.output.length === 0) {
    throw failureError(result.stderr);
  }

  // Verify the output: it must be AES-256, open with the chosen password
  // (and only with it), and carry exactly the requested restrictions.
  const out = result.output;
  const anonymous = await inspectPdf(run, out);
  const hasOpenPassword = opts.openPassword.length > 0;
  if (hasOpenPassword !== (anonymous.kind === "needs-password")) throw new PdfSecurityError("FAILED");
  const opened = hasOpenPassword ? await inspectPdf(run, out, opts.openPassword) : anonymous;
  if (opened.kind !== "opened") throw new PdfSecurityError("FAILED");
  const { info } = opened;
  if (info.revision !== 6 || info.bits !== 256) throw new PdfSecurityError("FAILED");
  const caps = info.capabilities;
  if (
    caps.printhigh !== opts.permissions.print ||
    caps.extract !== opts.permissions.copy ||
    caps.modifyother !== opts.permissions.edit
  ) {
    throw new PdfSecurityError("FAILED");
  }
  return { bytes: out, info };
}

export interface UnlockResult {
  bytes: Uint8Array;
  /** What the original file had: used for the "removed" summary. */
  before: EncryptionInfo;
  /** True when the file needed a password just to open. */
  hadOpenPassword: boolean;
}

/**
 * Removes all protection from a PDF whose password the user knows.
 * - Files that need a password to open: the open or permissions password works.
 * - Files that open freely but carry restrictions: only the permissions password works.
 * - Files that open freely and restrict nothing: no password is needed.
 */
export async function unlockPdf(run: QpdfRunner, bytes: Uint8Array, password: string): Promise<UnlockResult> {
  const anonymous = await inspectPdf(run, bytes);
  if (anonymous.kind === "not-encrypted") throw new PdfSecurityError("NOT_PROTECTED");
  const hadOpenPassword = anonymous.kind === "needs-password";

  // Encrypted, opens freely and restricts nothing: there is nothing to
  // protect, so no password is needed (other tools still refuse such files).
  const freeAndUnrestricted =
    anonymous.kind === "opened" && describeRestrictions(anonymous.info.capabilities).length === 0;

  if (!hadOpenPassword && password.length === 0 && !freeAndUnrestricted) {
    throw new PdfSecurityError("NEEDS_PERMISSIONS_PASSWORD");
  }
  if (hadOpenPassword && password.length === 0) throw new PdfSecurityError("WRONG_PASSWORD");

  let matched: { info: EncryptionInfo; password: string } | null =
    freeAndUnrestricted && anonymous.kind === "opened" ? { info: anonymous.info, password: "" } : null;
  for (const candidate of matched ? [] : passwordCandidates(password)) {
    const opened = await inspectPdf(run, bytes, candidate);
    if (opened.kind !== "opened") continue;
    // For a freely-opening file every password "opens" it as the empty user
    // password; only a real owner-password match counts.
    if (!hadOpenPassword && !opened.info.ownerPasswordMatched) continue;
    matched = { info: opened.info, password: candidate };
    break;
  }
  if (!matched) throw new PdfSecurityError("WRONG_PASSWORD");

  const result = await run(bytes, buildUnlockArgs(matched.password), true);
  if (!ok(result) || !result.output || result.output.length === 0) {
    throw failureError(result.stderr);
  }
  const check = await inspectPdf(run, result.output);
  if (check.kind !== "not-encrypted") throw new PdfSecurityError("FAILED");
  return { bytes: result.output, before: matched.info, hadOpenPassword };
}
