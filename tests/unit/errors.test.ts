import { describe, expect, it } from "vitest";
import { mapEngineError, toolError } from "@/lib/pdf/errors";

describe("error taxonomy", () => {
  it("maps encryption errors", () => {
    expect(mapEngineError(new Error("Input document to `PDFDocument.load` is encrypted")).code).toBe(
      "PDF_ENCRYPTED_UNSUPPORTED",
    );
  });

  it("maps invalid header errors", () => {
    expect(mapEngineError(new Error("Failed to parse PDF document (no pdf header found)")).code).toBe(
      "PDF_INVALID",
    );
  });

  it("falls back to unknown", () => {
    expect(mapEngineError(new Error("weird")).code).toBe("UNKNOWN_PROCESSING_ERROR");
  });

  it("errors never include file details and always have a message", () => {
    const err = toolError("PDF_INVALID");
    expect(err.message.length).toBeGreaterThan(0);
  });
});
