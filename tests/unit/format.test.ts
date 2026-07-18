import { describe, expect, it } from "vitest";
import { displayStem, formatBytes, outputFileName } from "@/lib/files/format";

describe("file formatting", () => {
  it("formats sizes", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("creates generic dated output names (no source-name concatenation)", () => {
    const name = outputFileName("merged", "pdf");
    expect(name).toMatch(/^merged-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it("strips extensions for display", () => {
    expect(displayStem("report.pdf")).toBe("report");
    expect(displayStem("archive.tar.gz")).toBe("archive.tar");
    expect(displayStem("noext")).toBe("noext");
  });
});
