import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { articles, toolGuides } from "@/content/articles";
import { getToolContent, toolContent } from "@/content/tools";
import { categoryPages } from "@/lib/seo/categories";
import { tools } from "@/lib/tools/registry";

/**
 * A tool page whose only text is a one-line description and a single FAQ entry
 * is a thin page. These tests are the guard that stopped that from being the
 * shipped state, so they assert substance, not just presence.
 */

function textOf(node: ReactNode): string {
  return renderToStaticMarkup(node as never)
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsOf(node: ReactNode): number {
  const text = textOf(node);
  return text.length === 0 ? 0 : text.split(" ").length;
}

describe("every tool has long-form page content", () => {
  it.each(tools.map((t) => t.slug))("%s has content", (slug) => {
    expect(getToolContent(slug)).toBeDefined();
  });

  it("has no content for a tool that does not exist", () => {
    const slugs = new Set(tools.map((t) => t.slug));
    for (const slug of Object.keys(toolContent)) {
      expect(slugs.has(slug), `orphaned content: ${slug}`).toBe(true);
    }
  });
});

describe("tool content is substantial", () => {
  it.each(tools.map((t) => t.slug))("%s has usable steps and sections", (slug) => {
    const content = getToolContent(slug);
    expect(content).toBeDefined();
    if (!content) return;
    expect(content.steps.length).toBeGreaterThanOrEqual(3);
    expect(content.sections.length).toBeGreaterThanOrEqual(3);
    for (const section of content.sections) {
      expect(section.heading.length).toBeGreaterThan(10);
    }
  });

  it.each(tools.map((t) => t.slug))("%s reads as a real page", (slug) => {
    const content = getToolContent(slug);
    if (!content) return;
    const total =
      wordsOf(content.lede) +
      content.steps.reduce<number>((n, s) => n + wordsOf(s), 0) +
      content.sections.reduce((n, s) => n + wordsOf(s.body), 0);
    // Well below what each page actually carries; this is a floor that catches
    // a stub being added later, not a target to write to.
    expect(total, `${slug} has only ${total} words`).toBeGreaterThan(350);
  });
});

describe("tool content is not boilerplate", () => {
  it("no section heading is reused across tools", () => {
    const seen = new Map<string, string>();
    for (const [slug, content] of Object.entries(toolContent)) {
      for (const section of content.sections) {
        const key = section.heading.toLowerCase();
        const owner = seen.get(key);
        expect(owner, `"${section.heading}" on ${slug} and ${owner}`).toBeUndefined();
        seen.set(key, slug);
      }
    }
  });

  it("every lede is unique", () => {
    const ledes = Object.values(toolContent).map((c) => textOf(c.lede));
    expect(new Set(ledes).size).toBe(ledes.length);
  });

  it("makes no absolute security or quality claims", () => {
    // Product principle: no "military-grade", "100% secure", "best" marketing.
    const banned = /military.grade|100% (secure|safe|private|anonymous)|perfectly secure|the best \w+ tool/i;
    for (const [slug, content] of Object.entries(toolContent)) {
      const all = [
        textOf(content.lede),
        ...content.steps.map(textOf),
        ...content.sections.map((s) => textOf(s.body)),
      ].join(" ");
      expect(banned.test(all), `${slug} makes an absolute claim`).toBe(false);
    }
  });
});

describe("guide cross-links resolve", () => {
  const articleSlugs = new Set(articles.map((a) => a.slug));
  const toolSlugs = new Set(tools.map((t) => t.slug));

  it("every toolGuides key is a real tool", () => {
    for (const slug of Object.keys(toolGuides)) {
      expect(toolSlugs.has(slug), `unknown tool: ${slug}`).toBe(true);
    }
  });

  it("every toolGuides value is a real guide", () => {
    for (const [slug, guides] of Object.entries(toolGuides)) {
      for (const guide of guides) {
        expect(articleSlugs.has(guide), `${slug} → ${guide}`).toBe(true);
      }
    }
  });

  it("a tool count quoted in a category description is true", () => {
    // "13 free PDF tools" was wrong by one. A description that miscounts the
    // catalogue is exactly the kind of detail a content reviewer checks.
    for (const category of categoryPages) {
      const quoted = category.description.match(/^(\d+)\s/);
      if (!quoted) continue;
      const actual = tools.filter((t) => t.category === category.category).length;
      expect(Number(quoted[1]), `${category.path} claims ${quoted[1]}`).toBe(actual);
    }
  });

  it("every guide has a publication date", () => {
    for (const article of articles) {
      expect(article.publishedAt, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(article.publishedAt))).toBe(false);
    }
  });
});
