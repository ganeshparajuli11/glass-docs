import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";

/**
 * These tests read the page sources as TEXT rather than importing them.
 * Importing an App Router page pulls in React, next/link and every client
 * component it renders, which makes a "did we ship placeholder copy?" check
 * depend on unrelated rendering concerns. Reading the file is blunt, fast and
 * fails for the right reason.
 */

const APP_DIR = join(process.cwd(), "src", "app");

function pageFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      pageFiles(full, found);
    } else if (entry === "page.tsx" || entry === "layout.tsx") {
      found.push(full);
    }
  }
  return found;
}

function routeFor(path: string): string {
  const relative = path.slice(APP_DIR.length + 1).replace(/\\/g, "/");
  const withoutFile = relative.replace(/(^|\/)(page|layout)\.tsx$/, "");
  return withoutFile === "" ? "/" : `/${withoutFile}`;
}

/** Developer notes are not user-visible copy, so they are not scanned. */
function stripComments(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

const files = pageFiles(APP_DIR).map((path) => {
  const source = readFileSync(path, "utf8");
  return {
    path,
    route: routeFor(path),
    kind: path.endsWith("layout.tsx") ? ("layout" as const) : ("page" as const),
    source,
    /** Source with comments removed — use for "is this copy public?" checks. */
    copy: stripComments(source),
  };
});

const pages = files.filter((f) => f.kind === "page");

function page(route: string) {
  const found = pages.find((p) => p.route === route);
  if (!found) throw new Error(`no page module for route ${route}`);
  return found;
}

describe("no placeholder or draft copy is publicly visible", () => {
  // Phrases that mean "this page is not finished". Audit TRUST-001/TRUST-002.
  const banned = [
    "before public launch",
    "to be reviewed before",
    "this page is a placeholder",
    "coming soon",
    "lorem ipsum",
    "TODO",
    "FIXME",
    "REAL OPERATOR NAME",
    "REAL MONITORED ADDRESS",
    "XXXXXXXX",
  ];

  it("finds at least the pages we expect to check", () => {
    expect(pages.length).toBeGreaterThan(5);
    expect(pages.map((p) => p.route)).toEqual(
      expect.arrayContaining(["/contact", "/privacy", "/terms", "/cookies"]),
    );
  });

  for (const phrase of banned) {
    it(`no page contains "${phrase}"`, () => {
      const offenders = pages
        .filter((p) => p.copy.toLowerCase().includes(phrase.toLowerCase()))
        .map((p) => p.route);
      expect(offenders).toEqual([]);
    });
  }

  it("no trust page is still marked as a draft", () => {
    const offenders = pages
      .filter((p) => /Draft\s*[—–-]/.test(p.copy))
      .map((p) => p.route);
    expect(offenders).toEqual([]);
  });
});

describe("trust pages carry accountable ownership details", () => {
  const trustRoutes = ["/privacy", "/terms", "/cookies", "/contact", "/about"];

  for (const route of trustRoutes) {
    it(`${route} references the operator or a contact route`, () => {
      expect(
        /site\.operator|site\.contact|operator\.name|contact\.email/.test(
          page(route).copy,
        ),
        `${route} names neither an operator nor a contact route`,
      ).toBe(true);
    });
  }

  it("privacy, terms and cookies state an effective date", () => {
    for (const route of ["/privacy", "/terms", "/cookies"]) {
      expect(page(route).copy, `${route} has no effective date`).toMatch(
        /effectiveDate|Effective \d{4}-\d{2}-\d{2}/,
      );
    }
  });

  it("the contact page publishes a real address and warns against sending files", () => {
    const contact = page("/contact");
    expect(contact.copy).toContain("mailto:");
    expect(contact.copy.toLowerCase()).toContain("do not email your documents");
  });

  it("site config contains no obviously fake contact details", () => {
    expect(site.contact.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
    expect(site.contact.email).not.toMatch(/example\.|test@|foo@/i);
    expect(site.operator.name.trim().length).toBeGreaterThan(2);
    expect(site.operator.repository).toMatch(/^https:\/\//);
  });
});

describe("title and canonical hygiene", () => {
  /** The homepage title literal, with `${site.name}` resolved. */
  function homepageTitle(): string {
    const raw = page("/").copy.match(/title:\s*[`"']([^`"']+)[`"']/)?.[1] ?? "";
    return raw.replaceAll("${site.name}", site.name);
  }

  it("the brand appears exactly once in the homepage title", () => {
    const title = homepageTitle();
    expect(title.length, "no title literal found on the homepage").toBeGreaterThan(
      10,
    );
    expect(title).toContain(site.name);
    expect(title.split(site.name).length - 1).toBe(1);
  });

  it("the homepage title is a sensible length for a search result", () => {
    const title = homepageTitle();
    expect(title.length).toBeGreaterThan(30);
    expect(title.length < 70, `homepage title is ${title.length} chars`).toBe(
      true,
    );
  });

  it("no page or layout hardcodes the production origin", () => {
    // Canonicals resolve through metadataBase; JSON-LD must use absoluteUrl()
    // so preview and staging builds do not emit production URLs (SCHEMA-002).
    const offenders = files
      .filter((f) => f.copy.includes("https://glasstools.net"))
      .map((f) => `${f.route} (${f.kind})`);
    expect(offenders).toEqual([]);
  });

  it("every page module declares metadata or generateMetadata", () => {
    const offenders = pages
      .filter((p) => p.path.endsWith("page.tsx"))
      .filter(
        (p) =>
          !p.source.includes("export const metadata") &&
          !p.source.includes("generateMetadata") &&
          !p.source.includes("categoryMetadata"),
      )
      .map((p) => p.route);
    expect(offenders).toEqual([]);
  });

  it("tool pages do not put the brand in their own title input", () => {
    // The root template appends "— GlassTools" to child segments already.
    const titleLine =
      page("/tools/[slug]").copy.match(/const title = [`"'][^`"']+[`"']/)?.[0] ??
      "";
    expect(titleLine.length).toBeGreaterThan(10);
    expect(titleLine).not.toContain(site.name);
  });
});
