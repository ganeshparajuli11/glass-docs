# Technical SEO Audit — glasstools.net

Audited: 2026-07-18 · Auditor: build agent (repository + live-site inspection)

## Stack facts (verified in repo)

| Item | Value |
|---|---|
| Framework | Next.js 16.2.10, App Router, React 19.2.4, TypeScript 5.9 strict |
| Rendering | Full static prerender (SSG); `DEPLOY_TARGET=static` → `output: "export"` → `out/` |
| Build | `npm run build:static`; 51 routes exported after this pass |
| Host | Cloudflare (user project, connected to GitHub; live at https://glasstools.net) |
| Engines | pdf-lib 1.17.1, pdfjs-dist 6.1.200 (lazy-loaded per tool route only) |
| Analytics | None installed (Cloudflare Web Analytics recommended, see master plan) |
| Ads | AdSense loader site-wide (verification); ad units gated off |

## Findings at audit time → resolution

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | No canonical URLs on any page | High | FIXED — self-referencing canonicals site-wide via `src/lib/seo/meta.ts` |
| 2 | No category landing pages (only `/tools?c=` query filter, not indexable as distinct pages) | High | FIXED — 5 static CollectionPages: /pdf-tools /image-tools /text-tools /calculators /student-tools |
| 3 | Structured data limited to FAQPage on tool pages | Medium | FIXED — added WebSite, Organization, BreadcrumbList, WebApplication, CollectionPage, Article |
| 4 | Guides not linked from tool pages (one-way linking) | Medium | FIXED — `toolGuides` map renders Related guides on tool pages |
| 5 | Homepage lacked descriptive-anchor links to tasks | Low | FIXED — "Jump straight to a task" block |
| 6 | 3 guides only; privacy-intent queries unserved | Medium | FIXED — 7 guides incl. "Are online PDF tools safe" |
| 7 | No last-reviewed signal on tool pages | Low | FIXED — renders registry `lastVerifiedAt` |
| 8 | OG image missing (cards render text-only) | Low | OPEN — needs a 1200×630 branded PNG (see master plan backlog) |
| 9 | AdSense site verification failed | High | FIXED — literal script tag in head + meta tag + ads.txt (all 3 Google methods) |
| 10 | No analytics | Medium | OPEN — owner action: enable Cloudflare Web Analytics (privacy-friendly, no consent banner needed) |

## Indexability check (against exported out/)

- All public routes prerender to real HTML files returning 200 on Cloudflare. ✓
- robots.ts allows all public paths, blocks /admin (route doesn't exist yet), references sitemap. ✓
- sitemap.ts includes only canonical, indexable, 200 routes (no query URLs, no planned tools). ✓
- No noindex anywhere; 404 page exists (`not-found.tsx`, exported as 404.html). ✓
- One `<h1>` per page — verified in template code (hero h1 on home, tool name on tool pages, article title on guides). ✓
- No staging URLs in sitemap; workers.dev deployment should be treated as non-canonical (owner: set the custom domain as primary; optionally disable the workers.dev route in Cloudflare to avoid duplicate indexing). ⚠ OWNER ACTION

## Canonical policy (decision)

Tool URLs remain `/tools/<slug>` — they are live, consistent, and already crawled.
Migrating to root-level `/merge-pdf`-style URLs (as the growth plan suggested) was
evaluated and rejected for now: it would add 29 redirects and re-crawl churn for
zero ranking evidence. Root level is used for the five category pages instead.
Revisit only with Search Console data showing a concrete need.
