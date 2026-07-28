# P1: indexing and information architecture

**Source:** `GLASSTOOLS_SEO_DEVELOPER_AUDIT.md`, findings IA-001 and IA-002
**Date:** 2026-07-28
**Follows:** `P0_AUDIT_IMPLEMENTATION.md`

---

## Why this work, and not something else

Search Console at 2026-07-28, ten days after the domain was registered:

| Metric | Value |
|---|---|
| Indexed pages | **2** |
| Not indexed | **48** |
| Impressions (3 months) | 6 |
| Clicks | 2 |
| Only query recorded | `glasstools` (branded) |
| Lighthouse mobile / desktop | 95 / 99, SEO 100 |

Performance is not the constraint. Nothing is blocked either — `robots.txt`
allows Googlebot, the sitemap lists all 49 URLs with `lastmod`, HTTPS is
clean.

What was wrong is what the crawler could actually see. Measured against the
live site:

| Page | Words in served HTML | Links |
|---|---|---|
| `/tools` — the hub for all 29 tools | **77** | **15** |
| `/tools/merge-pdf` | 288 | 22 |
| `/tools/split-pdf` | 231 | 21 |
| `/tools/word-counter` | 194 | 20 |
| homepage | 410 | 35 |

Those 15 links on `/tools` were the header and footer. Every tool card lived
inside a `"use client"` component, so the page that exists to link 29 tool
pages linked none of them until hydration. Google can render JavaScript, but a
ten-day-old domain with no authority gets a small crawl budget, and an
important directory should not make discovery conditional on rendering.

That is a mechanical, fixable contributor to 48 unindexed pages. Domain age is
the other, and no amount of code fixes that one.

---

## What changed

### IA-001: `/tools` renders its inventory on the server

`app/tools/page.tsx` is now a server component that maps over the registry
directly, grouped into a section per category. Each card is wrapped in a
`<li>` carrying `data-tool-slug`, `data-category` and `data-search`.

`ToolsFilter` (new, client) renders **controls only** — the search box,
category chips and result count. It filters by hiding and showing the markup
the server already emitted, setting both the `hidden` attribute and inline
`display: none` so hidden cards leave the accessibility tree. The grid is
never rendered twice.

`data-search` comes from `toolHaystack()` in `src/lib/tools/haystack.ts`,
which mirrors the fields and substring semantics of `searchTools()`. A test
runs both over the same queries and asserts they select identical sets, so
client-side filtering cannot drift from what the server would have done.

`ToolsExplorer.tsx` is retired — emptied rather than deleted, because the
tooling that made this change could not delete files. **Delete it.**

Also added: `ItemList` structured data naming all 29 tools with absolute URLs.

### IA-002: category hubs are site-wide

- **Header** gained a second row linking all five category hubs. Plain links,
  not a JavaScript dropdown, so every page carries a crawlable path into each
  hub. `Privacy` moved out of the top row to make space; it remains in the
  footer.
- **Footer** regrouped from "Popular tools / Site / Legal" into task-shaped
  groups: PDF tasks, Image tasks, Student workflows, Site, Legal — plus a
  category-hub row. A test caps it at 30 links so it cannot grow into a
  keyword wall.
- **Category pages** now cross-link each other and `/tools`, so no hub is a
  dead end.

### Workflow blocks

`src/lib/seo/workflows.ts` defines six task-shaped tool sequences — prepare an
assignment, clean a scan, send photos by email, get content out of a PDF, work
out where you stand, tidy up text. Rendered by `WorkflowBlocks` on `/tools`
and on each relevant category hub.

This is internal linking that follows intent rather than alphabet. It also
gives the assignment workflow, which is the most defensible niche the site
has, an actual home. Every slug is validated against the registry by tests.

### Result

`/tools` goes from 15 links, none of them to a tool, to every one of the 29
tool pages plus five category hubs — all in the initial HTML.

---

## Tests added

`tests/seo/inventory.test.ts` (22 assertions):

- the tools page maps over the registry and is not a client component;
- `ToolsFilter` never imports `ToolCard` or the registry, so it cannot become
  the only source of the cards again;
- client and server search agree across six representative queries;
- header and footer link every category hub, and the footer keeps its trust
  and legal routes;
- every workflow step resolves to a real tool, ids are unique and
  anchor-safe, and every category hub has at least one workflow.

`tests/e2e/inventory.spec.ts` runs part of the suite with
`javaScriptEnabled: false` and asserts every tool slug is linked from
`/tools`. That is the assertion that would have caught the original problem.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint` | clean |
| SEO suite | 75 assertions passing |
| `npm run build:static` | **not run** — Windows-only binaries in this sandbox |
| `npx playwright test` | **not run** — same reason |

Run `npm run verify` and `npx playwright test --project=chromium` on Windows
before pushing.

---

## After deploying

1. Search Console → URL Inspection on `https://glasstools.net/tools` → **Test
   live URL** → *View tested page* → check the rendered HTML now contains the
   tool links. Then request indexing, once.
2. Watch **Page indexing** weekly. The number to move is 48 not indexed. If
   pages shift from "Discovered – currently not indexed" to "Crawled –
   currently not indexed", crawling improved and content depth is the next
   constraint — which is CONTENT-001, still outstanding.
3. Do not resubmit repeatedly. It does not help.

---

## Still outstanding

- **CONTENT-001 / CONTENT-002** — tool pages at 194-288 words are thin against
  iLovePDF and Smallpdf. The typed per-tool SEO content model and enriched top
  ten pages are the next and largest piece of work.
- **SOCIAL-001** — no Open Graph images.
- **SCHEMA-001** — article dates are still one hardcoded value.
- **TOPIC-001** — the EMI calculator still dilutes topical focus.
- **PERF-001** — measured now: 95 mobile, 99 desktop. Effectively closed;
  revisit only if field data in Search Console disagrees.

## A note on expectations

`merge pdf` and `split pdf` belong to Adobe, iLovePDF and Smallpdf, who have
years of authority and large link profiles. This work does not compete for
those and no code change will.

What it makes possible is being found for the narrow queries where local
processing is the differentiator: *merge pdf without uploading*, *split a pdf
locally in the browser*, *remove pages from a confidential pdf*. Those have
real demand, low competition, and an honest answer only this site is set up to
give. Earn those first, then expand from whatever Search Console actually
reports.
