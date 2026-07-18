import { toolError, type ToolError } from "./errors";

/** File signature checks — do not trust extensions alone. */

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF

export function hasPdfSignature(bytes: Uint8Array): boolean {
  // The header may be preceded by up to 1024 junk bytes per spec tolerance;
  // we scan the first 1 KiB like common readers do.
  const limit = Math.min(bytes.length - PDF_MAGIC.length, 1024);
  for (let offset = 0; offset <= limit; offset += 1) {
    let found = true;
    for (let i = 0; i < PDF_MAGIC.length; i += 1) {
      if (bytes[offset + i] !== PDF_MAGIC[i]) {
        found = false;
        break;
      }
    }
    if (found) return true;
  }
  return false;
}

export interface ValidationOptions {
  maxRecommendedSizeMb: number;
}

export interface ValidationOk {
  ok: true;
  /** Non-blocking warning (e.g. over recommended size). */
  warning?: ToolError;
}

export interface ValidationFail {
  ok: false;
  error: ToolError;
}

export type ValidationResult = ValidationOk | ValidationFail;

export function validatePdfBytes(
  bytes: Uint8Array,
  opts: ValidationOptions,
): ValidationResult {
  if (bytes.length === 0) return { ok: false, error: toolError("FILE_EMPTY") };
  if (!hasPdfSignature(bytes)) return { ok: false, error: toolError("PDF_INVALID") };
  if (bytes.length > opts.maxRecommendedSizeMb * 1024 * 1024) {
    return { ok: true, warning: toolError("FILE_TOO_LARGE_RECOMMENDED") };
  }
  return { ok: true };
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isSupportedImageType(mime: string): boolean {
  return (IMAGE_TYPES as readonly string[]).includes(mime);
}

export function validateImageFile(
  file: { type: string; size: number },
  opts: ValidationOptions,
): ValidationResult {
  if (file.size === 0) return { ok: false, error: toolError("FILE_EMPTY") };
  if (!isSupportedImageType(file.type)) {
    return { ok: false, error: toolError("FILE_TYPE_UNSUPPORTED") };
  }
  if (file.size > opts.maxRecommendedSizeMb * 1024 * 1024) {
    return { ok: true, warning: toolError("FILE_TOO_LARGE_RECOMMENDED") };
  }
  return { ok: true };
}
