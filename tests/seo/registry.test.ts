import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { articles, toolGuides } from "@/content/articles";
import { site } from "@/config/site";
import { categoryPages } from "@/lib/seo/categories";
import { tools } from "@/lib/tools/registry";

const entries = sitemap();
const urls = entries.map((e) => e.url);

describe("sitemap coverage", () => {
  it("lists every tool exactly once", () => {
    for (const tool of tools) {
      const expected = `${site.url}/tools/${tool.slug}`;
      expect(urls.filter((u) => u === expected)).toHaveLength(1);
    }
  });

  it("lists every guide exactly once", () => {
    for (const article of articles) {
      const expected = `${site.url}/learn/${article.slug}`;
      expect(urls.filter((u) => u === expected)).toHaveLength(1);
    }
  });

  it("lists every category landing page", () => {
    for (const category of categoryPages) {
      expect(urls).toContain(`${site.url}${category.path}`);
    }
  });

  it("contains no duplicate URLs", () => {
    const seen = new Set<string>();
    const duplicates = urls.filter((u) => (seen.has(u) ? true : (seen.add(u), false)));
    expect(duplicates).toEqual([]);
  });

  it("every URL is absolute and on the configured origin", () => {
    for (const url of urls) {
      expect(url.startsWith(site.url), `${url} is not on ${site.url}`).toBe(true);
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("contains no query strings, fragments or double slashes in the path", () => {
    for (const url of urls) {
      const { pathname, search, hash } = new URL(url);
      expect(search, `${url} has a query string`).toBe("");
      expect(hash, `${url} has a fragment`).toBe("");
      expect(pathname.includes("//"), `${url} has a doubled slash`).toBe(false);
    }
  });

  it("does not list a trailing-slash variant of the homepage", () => {
    expect(urls).toContain(site.url);
    expect(urls).not.toContain(`${site.url}/`);
  });
});

describe("internal reference integrity", () => {
  const toolSlugs = new Set(tools.map((t) => t.slug));
  const articleSlugs = new Set(articles.map((a) => a.slug));

  it("every related-tool slug resolves", () => {
    for (const tool of tools) {
      for (const related of tool.relatedTools) {
        expect(toolSlugs.has(related), `${tool.slug} → ${related}`).toBe(true);
      }
    }
  });

  it("no tool links to itself as a related tool", () => {
    for (const tool of tools) {
      expect(tool.relatedTools).not.toContain(tool.slug);
    }
  });

  it("every category guide slug resolves", () => {
    for (const category of categoryPages) {
      for (const slug of category.guideSlugs) {
        expect(articleSlugs.has(slug), `${category.path} → ${slug}`).toBe(true);
      }
    }
  });

  it("every toolGuides entry points at a real tool and a real guide", () => {
    for (const [toolSlug, guideSlugs] of Object.entries(toolGuides)) {
      expect(toolSlugs.has(toolSlug), `toolGuides key ${toolSlug}`).toBe(true);
      for (const slug of guideSlugs) {
        expect(articleSlugs.has(slug), `${toolSlug} → ${slug}`).toBe(true);
      }
    }
  });

  it("every guide is linked from at least one tool page (two-way linking)", () => {
    const linked = new Set(Object.values(toolGuides).flat());
    const unlinked = articles.map((a) => a.slug).filter((s) => !linked.has(s));
    expect(unlinked).toEqual([]);
  });

  it("every tool links to at least one guide", () => {
    const missing = tools
      .map((t) => t.slug)
      .filter((slug) => !(toolGuides[slug]?.length > 0));
    expect(missing).toEqual([]);
  });

  it("every tool belongs to a category that has a landing page", () => {
    const covered = new Set(categoryPages.map((c) => c.category));
    for (const tool of tools) {
      expect(covered.has(tool.category), `${tool.slug} (${tool.category})`).toBe(
        true,
      );
    }
  });

  it("no tool is orphaned — each is reachable from another tool or a category", () => {
    const linked = new Set<string>();
    for (const tool of tools) for (const r of tool.relatedTools) linked.add(r);
    const orphans = tools
      .filter((t) => !linked.has(t.slug))
      .filter((t) => !categoryPages.some((c) => c.category === t.category))
      .map((t) => t.slug);
    expect(orphans).toEqual([]);
  });
});

describe("metadata uniqueness across tools and guides", () => {
  it("tool names are unique", () => {
    const names = tools.map((t) => t.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("tool descriptions are unique and non-trivial", () => {
    const descriptions = tools.map((t) => t.shortDescription.trim());
    for (const description of descriptions) {
      expect(description.length).toBeGreaterThan(20);
    }
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("guide titles and descriptions are unique and non-trivial", () => {
    const titles = articles.map((a) => a.title.trim());
    const descriptions = articles.map((a) => a.description.trim());
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const description of descriptions) {
      expect(description.length).toBeGreaterThan(40);
    }
  });

  it("no tool description repeats the brand name", () => {
    // The title template already appends the brand; repeating it wastes
    // snippet space and reads as keyword padding.
    for (const tool of tools) {
      expect(
        tool.shortDescription.includes(site.name),
        `${tool.slug} repeats the brand`,
      ).toBe(false);
    }
  });

  it("category metadata is unique", () => {
    const metaTitles = categoryPages.map((c) => c.metaTitle);
    const paths = categoryPages.map((c) => c.path);
    expect(new Set(metaTitles).size).toBe(metaTitles.length);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
