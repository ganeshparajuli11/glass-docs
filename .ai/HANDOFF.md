# Current Handoff

## Session update (2026-07-18, AdSense verification wiring)

- Publisher ID ca-pub-2661645060530542 (owner's real AdSense account) is now the default client ID in src/config/ads.ts (env-overridable).
- AdSense loader script renders site-wide from the root layout — required by Google for site verification/review. Confirmed present in every exported page's HTML.
- public/ads.txt published with the real ID (example file removed).
- CSP in public/_headers extended with Google ad domains so the loader isn't blocked.
- Ad DISPLAY remains off: NEXT_PUBLIC_ADSENSE_ENABLED unset + empty slot IDs → AdSlot renders null. After approval: create 3 ad units, paste slot IDs into src/config/ads.ts, set NEXT_PUBLIC_ADSENSE_ENABLED=true, redeploy.
- Owner reminders: keep Auto ads OFF in AdSense (or exclude /tools/*) per ad-placement spec; verify https://glasstools.net/ads.txt after deploy; review takes days-weeks.
- Verified: tests 58/58 ✓ typecheck ✓ lint ✓ static export ✓ (script + ads.txt confirmed in out/).

## Session update (2026-07-18, mobile + security pass)

- Mobile: header wraps safely at 320px with 44px targets; hero search compacted; 16px inputs on small screens (no iOS focus-zoom); touch-action manipulation; long filenames/diff lines wrap (break-anywhere); result rows wrap.
- Security: public/_headers added (CSP default-src 'self' + object-src 'none' + frame-ancestors 'none', HSTS, nosniff, referrer/permissions policies, COOP) with AdSense-ready CSP variant commented; immutable caching for /_next/static; JSON-LD < escaped; text inputs capped 200k chars.
- SECURITY.md documents the model: static site + client-side processing = no SQL/auth/server attack surface; scale is CDN-bound, not server-bound; untrusted-file handling summarized.
- Verified: tests 58/58 ✓ typecheck ✓ lint ✓ static export ✓ (29 tool pages, _headers included).
- Owner: after redeploy, spot-check headers at securityheaders.com.

## Session update (2026-07-18, expansion)

- Site expanded from 13 to 29 stable tools across five categories:
  PDF (13, unchanged) · Image (compressor with before/after sizes, resizer, crop, JPG/PNG/WebP converter, passport-photo sheet) ·
  Text (word counter, case converter, remove extra spaces, remove duplicate lines, text compare with diff) ·
  Calculators (GPA, assignment grade + required-mark, attendance, percentage, loan EMI with disclaimer) ·
  Student (assignment cover-page PDF generator).
- New pure-logic libraries with tests: src/lib/text/*, src/lib/calc/*, src/lib/image/passport.ts, src/lib/pdf/operations/cover-page.ts.
- Branding: GlassTools logo (src/app/icon.svg + header mark); no GlassDocs references remain.
- Homepage now has category exploration; /tools has 6 category filters and honours ?c=.
- Verified: lint ✓ typecheck ✓ tests 58/58 ✓ next build ✓ (46 routes) static export ✓ (29 tool pages, sitemap 40 URLs).
- NOTE: user must push to GitHub and rename the GitHub repo / Cloudflare Pages project from glass-docs to glasstools (owner action; see DEPLOYMENT_STEPS.md).

Updated: 2026-07-18 Asia/Kathmandu
Milestone: M3 (core tools) complete locally
Repository state: uncommitted (git not initialized in this folder yet — run `git init && git add -A && git commit -m "feat: GlassDocs MVP local build"`)

## Session update (2026-07-18, later)

- Rebranded GlassDocs → GlassTools; canonical URL https://glasstools.net (domain purchased, registrar status Pending).
- Static export configured: `npm run build:static` → `out/` (verified: all 13 tool pages, guides, sitemap with production URL, robots, pdf worker).
- Real AdSense integration wired into AdSlot (script loader + ins tags), still fully disabled: needs NEXT_PUBLIC_ADSENSE_ENABLED, valid ca-pub ID, and per-placement slot IDs in src/config/ads.ts. public/ads.txt.example added (never invent IDs).
- Owner launch checklist written: DEPLOYMENT_STEPS.md (Cloudflare Pages, nameservers, Search Console, AdSense apply/enable).
- Verified: lint ✓ typecheck ✓ tests 43/43 ✓ build ✓ static export ✓.

## Last completed task

- ID: T-001..T-047, T-102(local), T-110/T-111 (batch, autonomous full-local mode)
- Title: Full local MVP build — platform shell, PDF engine, all 13 tools, SEO/content, tests
- Result: `npm run verify` passes end-to-end (lint ✓, typecheck ✓, 42/42 tests ✓, build ✓, 29 static routes). HTTP smoke of production server returned 200 with correct content for all representative routes.

## Changed files

- Everything under `src/`, `tests/`, `scripts/`, `.github/`, plus `package.json`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `VERSIONS_SNAPSHOT.md`. See `.ai/FILE_MAP.md`.
- 2026-07-18 maintenance: `src/components/shell/BrandMark.tsx`, `src/components/shell/Header.tsx`, `src/app/icon.svg` — custom header logo and browser-tab icon.
- 2026-07-18 maintenance: `src/app/layout.tsx` — default metadata title now matches the navbar brand text exactly.

## Verification evidence

- `npx vitest run` — 7 files, 42 tests, all pass (includes pdf-lib golden/semantic integration tests: page counts, order, rotations, dimensions, metadata round-trip, invalid-input mapping).
- `npx tsc --noEmit` — clean. `npx eslint .` — clean.
- `npx next build` — success; 29 routes prerendered.
- `npm run build` after branding refresh — success; `app/icon.svg` emitted and header/logo changes compiled cleanly.
- `npm run build` after title alignment — success; metadata defaults compiled cleanly and static routes regenerated.
- `next start` + curl smoke: `/`, `/tools`, `/tools/merge-pdf`, `/tools/split-pdf`, `/tools/rotate-pdf`, `/learn`, article, `/privacy`, `/sitemap.xml`, `/robots.txt`, `/pdf.worker.min.mjs` → all 200 with expected content.
- Playwright E2E NOT yet executed (browser download blocked in build sandbox); specs and CI job exist.

## Current capability

A user can run `npm install && npm run dev`, open http://localhost:3000, search or browse 13 PDF tools, and complete every MVP workflow (merge, split, extract, rotate, reorder, delete, watermark, page numbers, images→PDF, PDF→images, view, metadata edit, text extraction) entirely in the browser with no upload, with progress, safe errors, and downloads.

## Next ready task

- ID: T-200/T-202 (QA depth) locally, or T-100 (Supabase admin) / T-210 (deployment) with the user.
- Why next: everything without external credentials is done.
- Read these files only: `.ai/PROJECT_STATE.md`, `.ai/TASK_BOARD.md`, `.ai/FILE_MAP.md`, and the spec file for the chosen task (06 for admin, 10 for deployment).
- Acceptance gate: per `.ai/TASK_BOARD.md`.

## Known issues/blockers

- E2E: run `npx playwright install chromium && npm run test:e2e` on a normal machine; sandbox network policy blocked the browser download (low severity — CI job configured).
- pdf-lib operations run on the main thread (documented dec