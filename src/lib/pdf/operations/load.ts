import { PDFDocument } from "pdf-lib";
import { mapEngineError, toolError } from "../errors";

export class PdfOperationError extends Error {
  toolError;
  constructor(toolErr: ReturnType<typeof toolError>) {
    super(toolErr.message);
    this.name = "PdfOperationError";
    this.toolError = toolErr;
  }
}

/** PdfLibAdapter load with safe error mapping. */
export async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch (err) {
    throw new PdfOperationError(mapEngineError(err));
  }
  if (doc.isEncrypted) {
    throw new PdfOperationError(toolError("PDF_ENCRYPTED_UNSUPPORTED"));
  }
  return doc;
}

export async function savePdf(doc: PDFDocument): Promise<Uint8Array> {
  try {
    return await doc.save();
  } catch (err) {
    throw new PdfOperationError(mapEngineError(err));
  }
}
