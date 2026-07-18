import { describe, expect, it } from "vitest";
import { hasPdfSignature, validatePdfBytes, validateImageFile } from "@/lib/pdf/validation";

const pdfHeader = new TextEncoder().encode("%PDF-1.7\nrest of file");

describe("pdf validation", () => {
  it("accepts a %PDF header", () => {
    expect(hasPdfSignature(pdfHeader)).toBe(true);
  });

  it("accepts a header preceded by junk within 1KiB", () => {
    const junk = new Uint8Array(100).fill(0x20);
    const bytes = new Uint8Array([...junk, ...pdfHeader]);
    expect(hasPdfSignature(bytes)).toBe(true);
  });

  it("rejects a fake .pdf (wrong signature)", () => {
    const fake = new TextEncoder().encode("MZ this is an exe actually");
    const result = validatePdfBytes(fake, { maxRecommendedSizeMb: 50 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("PDF_INVALID");
  });

  it("rejects empty files", () => {
    const result = validatePdfBytes(new Uint8Array(0), { maxRecommendedSizeMb: 50 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("FILE_EMPTY");
  });

  it("warns (not fails) over recommended size", () => {
    const result = validatePdfBytes(pdfHeader, { maxRecommendedSizeMb: 0.000001 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warning?.code).toBe("FILE_TOO_LARGE_RECOMMENDED");
  });
});

describe("image validation", () => {
  it("accepts jpeg/png/webp and rejects gif", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 10 }, { maxRecommendedSizeMb: 25 }).ok).toBe(true);
    expect(validateImageFile({ type: "image/webp", size: 10 }, { maxRecommendedSizeMb: 25 }).ok).toBe(true);
    const gif = validateImageFile({ type: "image/gif", size: 10 }, { maxRecommendedSizeMb: 25 });
    expect(gif.ok).toBe(false);
    if (!gif.ok) expect(gif.error.code).toBe("FILE_TYPE_UNSUPPORTED");
  });
});
