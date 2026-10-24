# SEO Test Results

Date: 2026-07-18 · Environment: build sandbox (no browser available)

## Ran and passed (this session)

| Test | Result |
|---|---|
| Production build (next build) | PASS — 51 routes |
| Static export (DEPLOY_TARGET=static) | PASS — see per-URL audit below |
| Type check (tsc strict) | PASS |
| Lint (eslint) | PASS (0 errors) |
| Unit/integration tests (vitest) | PASS 58/58 |
| Sitemap contains only canonical 200 routes | PASS (41 URLs, no query/param URLs) |
| Per-exported-page audit: exactly one h1, unique title, unique description, self-canonical present | PASS — scripted check over out/*.html (see below) |
| AdSense tag literal in head of every page | PASS (script + meta + ads.txt) |
| robots.txt references sitemap, blocks nothing needed | PASS |

## Could not run here (owner/CI actions, do not mark passed)

| Test | How to run |
|---|---|
| Lighthouse mobile/desktop | pagespeed.web.dev on live URLs |
| Rich Results / Schema validation | links in STRUCTURED-DATA-PLAN.md |
| Playwright E2E + axe accessibility | `npx playwright install chromium && npm run test:e2e` locally, or CI |
| Real-device 320–414px sweep | phone + DevTools device mode |
| Broken-link crawl of live site | after deploy: any crawler, or Search Console coverage |

## Per-URL audit output

See scripted results appended at the bottom of this file by
`scripts/audit-seo-export.mjs` (run automatically before sync).

---
Audit run 2026-07-18T15:08:53.233Z: 49 pages, 0 problems


---
Audit run 2026-10-23T20:47:04.591Z: 55 pages, 0 problems


---
Audit run 2026-10-23T20:51:52.788Z: 55 pages, 0 problems


---
Audit run 2026-10-23T20:52:09.041Z: 55 pages, 0 problems


---
Audit run 2026-10-24T20:43:14.045Z: 56 pages, 0 problems

