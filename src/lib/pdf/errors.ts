/** Stable, user-safe error taxonomy. See 03_ARCHITECTURE §7. */
export type ToolErrorCode =
  | "FILE_TYPE_UNSUPPORTED"
  | "FILE_TOO_LARGE_RECOMMENDED"
  | "FILE_EMPTY"
  | "PDF_INVALID"
  | "PDF_ENCRYPTED_UNSUPPORTED"
  | "PDF_PARSE_FAILED"
  | "PAGE_RANGE_INVALID"
  | "MEMORY_LIMIT_REACHED"
  | "OPERATION_CANCELLED"
  | "OUTPUT_FAILED"
  | "BROWSER_UNSUPPORTED"
  | "UNKNOWN_PROCESSING_ERROR";

export interface ToolError {
  code: ToolErrorCode;
  /** Safe, plain-language message. Never contains file contents or names. */
  message: string;
  /** Optional suggestion the user can act on. */
  recovery?: string;
}

const messages: Record<ToolErrorCode, { message: string; recovery?: string }> = {
  FILE_TYPE_UNSUPPORTED: {
    message: "This file type is not supported by this tool.",
    recovery: "Check the accepted formats listed above and try another file.",
  },
  FILE_TOO_LARGE_RECOMMENDED: {
    message: "This file is larger than the recommended size for smooth in-browser processing.",
    recovery: "You can still try, but processing may be slow or fail on low-memory devices.",
  },
  FILE_EMPTY: {
    message: "The selected file is empty.",
    recovery: "Choose a file that contains data.",
  },
  PDF_INVALID: {
    message: "This file does not look like a valid PDF.",
    recovery: "Make sure the file opens in a PDF reader, then try again.",
  },
  PDF_ENCRYPTED_UNSUPPORTED: {
    message: "This PDF is password-protected, which this tool cannot process yet.",
    recovery: "Remove the password with the software that created it, then try again.",
  },
  PDF_PARSE_FAILED: {
    message: "The PDF could not be read. It may be damaged or use unsupported features.",
    recovery: "Try re-saving or re-exporting the PDF, then process it again.",
  },
  PAGE_RANGE_INVALID: {
    message: "The page selection is not valid for this document.",
    recovery: "Use a format like 1-3, 5, 8-10 within the document's page count.",
  },
  MEMORY_LIMIT_REACHED: {
    message: "The browser ran out of memory while processing.",
    recovery: "Close other tabs, use a smaller file, or try on a device with more memory.",
  },
  OPERATION_CANCELLED: {
    message: "Processing was cancelled.",
  },
  OUTPUT_FAILED: {
    message: "The result could not be generated.",
    recovery: "Try again. If it keeps failing, the input may use unsupported features.",
  },
  BROWSER_UNSUPPORTED: {
    message: "Your browser is missing a capability this tool needs.",
    recovery: "Update your browser or try a current version of Chrome, Edge, Firefox, or Safari.",
  },
  UNKNOWN_PROCESSING_ERROR: {
    message: "Something unexpected went wrong while processing.",
    recovery: "Try again with the same or a different file.",
  },
};

export function toolError(code: ToolErrorCode): ToolError {
  return { code, ...messages[code] };
}

/** Maps a thrown value from a PDF engine to a safe ToolError. */
export function mapEngineError(err: unknown): ToolError {
  const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  const lower = text.toLowerCase();
  if (lower.includes("encrypt") || lower.includes("password")) {
    return toolError("PDF_ENCRYPTED_UNSUPPORTED");
  }
  if (
    lower.includes("no pdf header") ||
    lower.includes("invalid pdf") ||
    lower.includes("failed to parse") ||
    lower.includes("expected instance of pdfdict") ||
    lower.includes("invalidpdfexception")
  ) {
    return toolError("PDF_INVALID");
  }
  if (lower.includes("out of memory") || lower.includes("allocation")) {
    return toolError("MEMORY_LIMIT_REACHED");
  }
  if (lower.includes("cancel")) {
    return toolError("OPERATION_CANCELLED");
  }
  return toolError("UNKNOWN_PROCESSING_ERROR");
}
