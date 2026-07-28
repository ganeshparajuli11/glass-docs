import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { categoryPages } from "@/lib/seo/categories";
import { workflows } from "@/lib/seo/workflows";
import { tools } from "@/lib/tools/registry";
import { toolHaystack } from "@/lib/tools/haystack";
import { searchTools } from "@/lib/tools/registry";

const src = (...parts: string[]) =>
  readFileSync(join(process.cwd(), "src", ...parts), "utf8");

const toolsPage = src("app", "tools", "page.tsx");
const header = src("components", "shell", "Header.tsx");
const footer = src("components", "shell", "Footer.tsx");
const filter = src("components", "tool", "ToolsFilter.tsx");

/**
 * IA-001. Before this work, /tools shipped 77 words and 15 links because
 * every tool card lived inside a client component. These tests exist so the
 * inventory cannot quietly slip back behind a hydration boundary.
 */
describe("the tools index renders its inventory on the server", () => {
  it("the page maps over the registry itself", () => {
    expect(toolsPage).toContain("tools.filter");
    expect(toolsPage).toContain("ToolCard");
    expect(toolsPage).toContain("data-tool-slug");
  });

  it("the page is not a client component", () => {
    expect(toolsPage.startsWith('"use client"')).toBe(false);
    expect(toolsPage).not.toContain('"use client"');
  });

  it("the filter component renders controls only, never the cards", () => {
    expect(filter.startsWith('"use client"')).toBe(true);
    expect(filter).not.toContain("ToolCard");
    expect(filter).not.toContain("from \"@/lib/tools/registry\"");
  });

  it("the filter derives its result count instead of setting state in an effect", () => {
    // Cascading renders aside, deriving during render is what keeps the count
    // and the DOM from disagreeing after a fast sequence of keystrokes.
    expect(filter).toContain("useMemo");

    // Only the setters actually returned by useState count — a local helper
    // named setSomething inside the effect is not a state update.
    const stateSetters = [
      ...filter.matchAll(/const\s*\[\s*\w+\s*,\s*(set\w+)\s*\]\s*=\s*useState/g),
    ].map((match) => match[1]);
    expect(stateSetters.length).toBeGreaterThan(0);

    const effectBody =
      filter.match(/useEffect\(\(\) => \{([\s\S]*?)\n {2}\}, \[/)?.[1] ?? "";
    expect(effectBody.length, "could not locate the effect body").toBeGreaterThan(50);

    for (const setter of stateSetters) {
      expect(effectBody, `${setter}() is called inside the effect`).not.toContain(
        `${setter}(`,
      );
    }
  });

  it("the page hands the filter a serialisable summary, not components", () => {
    expect(toolsPage).toContain("toolHaystack");
    expect(toolsPage).toContain("<ToolsFilter");
  });

  it("no page imports the retired client-side explorer", () => {
    expect(toolsPage).not.toContain("ToolsExplorer");
  });

  it("groups by every category so no tool can be left out of the markup", () => {
    // The page renders one section per category page and filters the registry
    // by category, so coverage follows from both sets agreeing.
    const registryCategories = new Set(tools.map((t) => t.category));
    const rendered = new Set(categoryPages.map((c) => c.category));
    for (const category of registryCategories) {
      expect(rendered.has(category), `no section renders ${category}`).toBe(
        true,
      );
    }
  });

  it("emits ItemList structured data covering the whole registry", () => {
    expect(toolsPage).toContain("ItemList");
    expect(toolsPage).toContain("numberOfItems");
    expect(toolsPage).toContain("absoluteUrl");
  });
});

describe("client filtering matches server search semantics", () => {
  // The filter matches a substring against data-search. If that string ever
  // stops mirroring searchTools(), the two would disagree and the visible
  // result would depend on whether JavaScript had run.
  const cases = ["merge", "combine", "jpg to pdf", "gpa", "passport", "split"];

  for (const query of cases) {
    it(`"${query}" selects the same tools either way`, () => {
      const server = searchTools(query)
        .map((t) => t.slug)
        .sort();
      const client = tools
        .filter((t) => toolHaystack(t).includes(query.trim().toLowerCase()))
        .map((t) => t.slug)
        .sort();
      expect(client).toEqual(server);
    });
  }

  it("an empty query keeps every tool visible", () => {
    expect(searchTools("")).toHaveLength(tools.length);
  });
});

describe("category hubs are reachable site-wide", () => {
  it("the header links every category hub", () => {
    expect(header).toContain("categoryPages");
    expect(header).toContain("Tool categories");
  });

  it("the footer links every category hub", () => {
    expect(footer).toContain("categoryPages");
  });

  it("the footer still carries the trust and legal routes", () => {
    for (const path of ["/privacy", "/terms", "/cookies", "/contact", "/about"]) {
      expect(footer, `footer lost ${path}`).toContain(path);
    }
  });

  it("the footer stays a curated list, not a keyword wall", () => {
    const links = footer.match(/href: "\/[^"]*"/g) ?? [];
    expect(links.length).toBeGreaterThan(10);
    expect(links.length < 30, `footer has ${links.length} links`).toBe(true);
  });
});

describe("workflow blocks reference real tools", () => {
  const slugs = new Set(tools.map((t) => t.slug));

  it("every workflow step resolves to a tool in the registry", () => {
    for (const workflow of workflows) {
      for (const step of workflow.steps) {
        expect(slugs.has(step.slug), `${workflow.id} → ${step.slug}`).toBe(true);
      }
    }
  });

  it("every workflow has at least three steps and a real description", () => {
    for (const workflow of workflows) {
      expect(workflow.steps.length).toBeGreaterThan(2);
      expect(workflow.description.length).toBeGreaterThan(60);
    }
  });

  it("workflow ids are unique and anchor-safe", () => {
    const ids = workflows.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("every category hub has at least one workflow", () => {
    for (const category of categoryPages) {
      const matching = workflows.filter((w) =>
        w.categories.includes(category.category),
      );
      expect(
        matching.length > 0,
        `${category.path} has no workflow block`,
      ).toBe(true);
    }
  });

  it("no workflow step links straight back to the step before it", () => {
    for (const workflow of workflows) {
      for (let i = 1; i < workflow.steps.length; i += 1) {
        expect(workflow.steps[i].slug).not.toBe(workflow.steps[i - 1].slug);
      }
    }
  });
});
