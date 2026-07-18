import { describe, expect, it } from "vitest";
import { getTool, searchTools, tools } from "@/lib/tools/registry";
import { validateRegistry } from "@/lib/tools/validate";

describe("tool registry", () => {
  it("has no validation problems", () => {
    expect(validateRegistry()).toEqual([]);
  });

  it("contains all 13 MVP tools", () => {
    expect(tools.length).toBe(13);
  });

  it("every tool is local processing for MVP", () => {
    for (const t of tools) expect(t.processingMode).toBe("local");
  });

  it("finds tools by keyword synonyms", () => {
    expect(searchTools("combine").map((t) => t.slug)).toContain("merge-pdf");
    expect(searchTools("jpg to pdf").map((t) => t.slug)).toContain("images-to-pdf");
  });

  it("returns undefined for unknown slug", () => {
    expect(getTool("nope")).toBeUndefined();
  });
});
