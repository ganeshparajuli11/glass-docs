import { describe, expect, it } from "vitest";
import { getTool, searchTools, tools } from "@/lib/tools/registry";
import { validateRegistry } from "@/lib/tools/validate";

describe("tool registry", () => {
  it("has no validation problems", () => {
    expect(validateRegistry()).toEqual([]);
  });

  it("contains all 31 tools (29 launch tools + compress-pdf + image-to-text)", () => {
    expect(tools.length).toBe(31);
    expect(getTool("compress-pdf")?.category).toBe("pdf");
    expect(getTool("image-to-text")?.category).toBe("image");
  });

  it("every tool is local processing for MVP", () => {
    for (const t of tools) expect(t.processingMode).toBe("local");
  });

  it("finds tools by keyword synonyms", () => {
    expect(searchTools("combine").map((t) => t.slug)).toContain("merge-pdf");
    expect(searchTools("jpg to pdf").map((t) => t.slug)).toContain("images-to-pdf");
    expect(searchTools("gpa").map((t) => t.slug)).toContain("gpa-calculator");
    expect(searchTools("passport").map((t) => t.slug)).toContain("passport-photo");
    expect(searchTools("reduce pdf size").map((t) => t.slug)).toContain("compress-pdf");
    expect(searchTools("ocr").map((t) => t.slug)).toContain("image-to-text");
    expect(searchTools("screenshot to text").map((t) => t.slug)).toContain("image-to-text");
  });

  it("returns undefined for unknown slug", () => {
    expect(getTool("nope")).toBeUndefined();
  });
});
