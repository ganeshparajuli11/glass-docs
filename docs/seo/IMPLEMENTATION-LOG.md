# SEO Implementation Log

## 2026-08-12 — AdSense "Low value content" remediation

Google rejected the site for low value content. Diagnosis: 29 tool pages each
carried ~80 words of unique text (one-line description, a limits list, one or
two FAQ entries) around a client-rendered workspace, against 7 guides. The tool
UI is JavaScript, so a crawler saw a near-empty templated page 29 times.

Code changes:
- `src/content/tools/{types,pdf,image,text,study}.tsx` — long-form content for
  all 29 tools: lede, how-to steps written against the tool's real controls, and
  3–4 sections on choosing settings, pitfalls, and when another tool is better.
  Rendered below the workspace in `app/tools/[slug]/page.tsx`.
- 5 new guides (12 total): rotate-one-page-in-a-pdf, passport-photo-sizes-
  explained, gpa-scales-explained, pdf-too-large-to-email,
  cannot-copy-text-from-pdf.
- `Article.publishedAt` added; Article JSON-LD and the sitemap now use it
  instead of a hard-coded 2026-07-18 (closes SCHEMA-001).
- Category hubs link the new guides; `/text-tools` and `/calculators` are no
  longer guide-less. `/pdf-tools` claimed 13 PDF tools; there are 12.
- `tests/seo/tool-content.test.ts` — content floor per tool, no reused section
  headings, no absolute security claims, cross-links resolve, quoted counts true.

Measured: /tools/merge-pdf went from ~320 to ~860 words of rendered text.

Deliberately NOT done:
- No FAQ padding on tool pages — the long-form sections answer more, in prose.
- No pages for tools that do not exist; the oversized-PDF guide says plainly
  that there is no PDF compressor yet rather than implying one.

## 2026-07-18 — Foundation pass (this session)

Code changes:
- src/lib/seo/meta.ts — canonical/OG/Twitter builder; applied to every page.
- 5 category landing pages (/pdf-tools /image-tools /text-tools /calculators
  /student-tools) with real intro copy, tool grids, guide links, CollectionPage
  + BreadcrumbList JSON-LD; homepage category cards now target them.
- Structured data: WebSite+Organization (home), BreadcrumbList + WebApplication
  (all 29 tool pages, joined with existing FAQPage), Article (7 guides).
- 4 new guides (safety, remove-pages, shrink-images, assignment-pipeline);
  toolGuides map → "Related guides" section on 19 tool pages.
- Homepage: unique metadata + canonical, "Jump straight to a task" descriptive
  anchors, category links.
- Tool pages: canonical + OG/Twitter, "Last reviewed" date from registry.
- Sitemap: +5 category routes (now 41 URLs).
- AdSense: google-adsense-account meta tag added (3rd verification method).

Deliberately NOT done (with reasons):
- No pages for word-to-pdf / pdf-to-word / compress-pdf / protect-pdf — tools
  don't exist; pages would violate the "working tool first" rule.
- No URL migration of /tools/* to root — churn without evidence (see audit).
- No hreflang/i18n — English-only until human translations exist.
- No OG images — needs design asset; backlog.
- No analytics code — Cloudflare Web Analytics is an owner dashboard toggle.
