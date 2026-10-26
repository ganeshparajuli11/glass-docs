import { describe, expect, it } from "vitest";
import { extensionFor, formatSupportsAlpha, OPAQUE_BACKGROUND } from "@/lib/image/process";

describe("image output formats", () => {
  it("knows JPEG cannot store transparency", () => {
    expect(formatSupportsAlpha("image/jpeg")).toBe(false);
    expect(formatSupportsAlpha("image/png")).toBe(true);
    expect(formatSupportsAlpha("image/webp")).toBe(true);
  });

  it("flattens onto white, as the converter promises", () => {
    expect(OPAQUE_BACKGROUND).toBe("#ffffff");
  });

  it("maps formats to file extensions", () => {
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(extensionFor("image/png")).toBe("png");
    expect(extensionFor("image/webp")).toBe("webp");
  });
});
