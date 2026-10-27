# Current Handoff

## Session update (2026-10-27, daily contributor — TOOL day: Scanned PDF to text OCR)

- Shipped /tools/ocr-pdf "Scanned PDF to text (OCR)" (32 tools live, PDF hub 14). Logic: src/lib/ocr/pdf.ts (pure: pdfOcrScale ~300 DPI capped at 4000 px, selectOcrPages empty=all / ≤50 pages per run with an explicit message, textFromItems rebuilds lines from pdf.js hasEOL, hasUsableTextLayer ≥40 letters/marks/digits so "Scanned with…" footers don't count, combinePageTexts with "--- Page N ---" markers, summarisePdfOcr char-weighted confidence). UI: src/features/ocr-pdf/OcrPdfTool.tsx — page range, "use the PDF's own text" toggle (default on; mixed PDFs copy real text exactly), languages, line-break mode, page markers, Cancel keeps pages already read, editable result, copy/.txt. Reuses src/lib/ocr/engine.ts (tesseract.js worker kept until languages change).
- BUG FIX (sitewide): pdf.js 6 decodes CCITT fax / JBIG2 / JPEG 2000 via WebAssembly loaded from `wasmUrl`, which was never set — black-and-white scanner PDFs rendered BLANK in the viewer, PDF to images and OCR. scripts/copy-pdf-worker.mjs now copies pdfjs-dist/wasm decoders + licences into public/pdfjs/wasm (git-ignored); openDocument passes wasmUrl. ADR-009. Verified: blocking /pdfjs/wasm/* reproduces the blank page; with it, the CCITT page OCRs exactly and PDF to images renders it.
- Content: long-form tool content (5 sections) + 5 FAQs; extract-text limitation/FAQ/error/hint/content now point to the new tool; image-to-text FAQ + section updated; cannot-copy-text guide's "If it is a scan" rewritten around the tool (manual crop route kept for two-column pages); /pdf-tools description count derived from registry + new intro paragraph; toolGuides wired.
- Tests: +17 (tests/unit/ocr-pdf.test.ts) +registry 31→32 and search assertions; 307 total. Verified: npm run verify ✓ · build:static ✓ · audit 59 pages 0 problems ✓ · Playwright on out/ with production CSP: 2-page JPEG scan read exactly (95%), mixed PDF (typed page via text layer + scanned page via OCR), CCITT G4 scan, forced-OCR mode, cancel, 320px dark no h-scroll; only external request/console error = sandbox-blocked AdSense loader.
- Next: SEO day — T-316 guides for attendance/EMI/percentage calculators, or OCR/scanning guide improvements. Following TOOL day: HEIC to JPG/PNG.

## Session update (2026-10-26, daily contributor — SEO day: photo-for-online-form guide + JPEG transparency fix)

- New guide /learn/resize-photo-for-online-form (14 guides): crop to shape → resize to exact px → format → KB limit, for exam/job/visa portal photos and signatures. Claims checked against the code: crop presets (Free/1:1/4:3/16:9/3:4) + live "Output: W × H px" line; resizer lock/unlock, 1–10000 px, JPEG q=0.92, filename `-WxH`; compressor keeps dimensions, slider 30–95%, shows size; formatBytes uses 1024; cm→px at DPI maths; Chromium-saved JPEGs carry JFIF density units 0 (no DPI) — verified.
- Wired: toolGuides for image-resizer, crop-image, image-converter, image-compressor; /image-tools guideSlugs (first); shrink-images-for-email links to it.
- BUG FIX (found while fact-checking): canvas JPEG export turned transparent pixels BLACK in Chromium, although the converter UI and content promised white. src/lib/image/process.ts encodeCanvas now flattens onto #ffffff for JPEG (new formatSupportsAlpha + OPAQUE_BACKGROUND). Affects converter, resizer, crop, compressor. Verified in browser: transparent PNG → JPG corners (255,255,255).
- Tests: +3 (tests/unit/image-process.test.ts), 287 total. Verified: npm run verify ✓ · build:static ✓ · audit 58 pages 0 problems ✓ · Playwright on out/: 320px dark + 1280px light no h-scroll, Article + BreadcrumbList JSON-LD, links present on /tools/image-resizer, /image-tools, /learn/shrink-images-for-email. Only console errors: sandbox-blocked AdSense loader.
- Gotcha: `pkill -f "http.server 8080"` inside a compound Bash command kills that same shell (its command line matches) — kill the server in a separate call.
- T-316 left: attendance, EMI, percentage calculators.
- Next: TOOL day — T-323 OCR for scanned PDFs.

## Session update (2026-10-25, daily contributor — TOOL day: Image to text OCR)

- Shipped /tools/image-to-text (31 tools live). Logic: src/lib/ocr/languages.ts (eng/nep/hin, `eng+nep` builder, max 2, same-origin asset paths), src/lib/ocr/text.ts (tidy, join paragraphs w/ hyphen + list handling, confidence advice), src/lib/ocr/progress.ts (logger→ProgressState, 0.5–2× scaling), src/lib/ocr/engine.ts (dynamic import of tesseract.js, OEM LSTM_ONLY, workerBlobURL:false). UI: src/features/image-to-text/ImageToTextTool.tsx (paste support, editable result, copy/download, worker reused until languages change, terminated on unmount).
- Assets: scripts/copy-ocr-assets.mjs runs in dev/build/build:static and copies worker + 3 LSTM cores + 3 models into public/ocr (git-ignored, ~17 MB on disk; a visitor downloads one ~4 MB core + ~1.4–2.9 MB per model once; IndexedDB caches models). Cloudflare's build runs build:static, so assets are regenerated on deploy.
- CSP: added 'wasm-unsafe-eval' to script-src (needed for WebAssembly; no JS eval). /ocr/* cache header added. ADR-008 records the reversal of ADR-005 for OCR.
- Content: tool content + 5 FAQs; cannot-copy-text guide now has an on-device OCR route; extract-text copy/FAQ/limits no longer say "OCR not available".
- Gotcha: Tailwind `text-base` here sets COLOR to --color-base (page background), not font size — use text-sm/text-lg for headings.
- Tests: +20 unit (tests/unit/ocr.test.ts), 284 total; registry 31. Verified: npm run verify ✓ · build:static ✓ · audit 57 pages 0 problems ✓ · Playwright on out/ with production CSP: exact recognition of a sample PNG, 320px dark + 1280px light, eng+nep loads.
- Local e2e (npx playwright test) cannot run in this sandbox (repo Playwright wants chromium_headless_shell-1228, not installed); CI runs it.
- Next: SEO day (GROWTH-LOG decides) — e.g. a guide for image-converter/resizer/crop or percentage/EMI (T-316). Following TOOL day: T-323 OCR for scanned PDFs.

## Session update (2026-10-24, daily contributor — SEO day: text clean-up guide)

- New guide /learn/clean-up-pasted-text (13 guides): order of operations for text pasted from PDFs, spreadsheets and merged lists; every claim checked against src/lib/text/transform.ts and diff.ts (tabs collapse, blank lines dedupe to one, title/sentence case lower-case first, sort is localeCompare text order, line-level diff).
- Wired: toolGuides for case-converter, remove-spaces, dedupe-lines, text-compare (previously no guide) + word-counter, extract-text; /text-tools guideSlugs; cannot-copy-text-from-pdf links to it.
- Guide pages (all 13) now show "Tools used in this guide" (reverse of toolGuides, 44px pills) and emit BreadcrumbList JSON-LD (Guides → article).
- Tests: +2 in tests/seo/registry.test.ts (toolGuides integrity; every guide linked from >=1 tool). 261 total.
- Verified: npm run verify ✓ · build:static ✓ · audit 56 pages 0 problems ✓ · Playwright: 320px no horizontal scroll, light+dark, both JSON-LD blocks parse, links present on /tools/dedupe-lines, /text-tools, /learn/cannot-copy-text-from-pdf.
- Still without a dedicated guide (T-316): percentage-calculator, emi-calculator, attendance-calculator (only GPA guide), image-converter, image-resizer, crop-image.
- Next: TOOL day — OCR image→text (T-321).

## Session update (2026-10-23, daily contributor — TOOL day: Compress PDF)

- Shipped /tools/compress-pdf (30 tools live). Logic: src/lib/pdf/operations/compress.ts (pure, injected recoder) + src/lib/pdf/image-data.ts (JPEG header/EXIF strip, PNG/TIFF un-predict, fitWithin); browser recoder src/lib/image/pdf-recoder.ts (canvas JPEG); UI src/features/compress-pdf/CompressPdfTool.tsx.
- Safety rules: skips CMYK/indexed/Lab/Separation, ImageMask, SMask targets, colour-key masks, Decode arrays, non-8-bit, filter chains, streams <8 KiB; replacement kept only if ≤90% of original; output never larger than input (UI says so and offers Extract pages).
- Content: long-form tool content + 4 FAQs; pdf-too-large-to-email guide updated (old "no compressor" section replaced); assignment guide + workflow link the tool; toolGuides mapping added. Page counts now derived from tools.length.
- Tests: +25 (tests/unit/image-data.test.ts, tests/integration/compress.test.ts, fixtures in tests/fixtures/). registry count test updated 29→30.
- Verified: npm run verify ✓ (259 tests) · build:static ✓ · audit 55 pages 0 problems ✓ · Playwright on out/: 1.6 MB → 424 KB (−72%), output renders identically (pdftoppm diff ≈1/255), 320px no horizontal scroll, light+dark, only console errors are the sandbox-blocked AdSense loader.
- Next: SEO day (docs/GROWTH-LOG.md decides). Then OCR image→text (T-321).

## Session update (2026-07-18, SEO foundation + AdSense verify fix)

- AdSense: all 3 Google verification methods now in the build — literal head script tag, google-adsense-account meta tag, live ads.txt (confirmed live). Verification failed earlier because the deployed build predates the literal-tag fix; passes after next push. Fallback: choose the Ads.txt method in the AdSense dialog.
- SEO shipped: self-canonicals + unique OG/Twitter metadata sitewide (lib/seo/meta.ts); 5 root category landing pages; JSON-LD (WebSite, Organization, BreadcrumbList, WebApplication, CollectionPage, Article + existing FAQPage); 4 new guides (7 total) with two-way tool↔guide linking (toolGuides map); homepage task anchors; last-reviewed dates; sitemap now 49 URLs incl. categories.
- docs/seo/ created: 10 documents (master plan + 9 supporting). Honest constraints recorded: Google Trends protocol is an owner action; Lighthouse/rich-results tests need live URLs.
- New script: scripts/audit-seo-export.mjs — audits every exported page (unique title/description, single h1, canonical). Current run: 49 pages, 0 problems.
- Deliberately NOT built: pages for word-to-pdf/pdf-to-word/compress-pdf/protect-pdf (tools don't exist — see KEYWORD-RESEARCH.md). compress-pdf is the top build item next.
- Verified: build ✓ export ✓ tests 58/58 ✓ lint ✓ tsc ✓ audit 0 problems ✓.

## Session update (2026-07-18, AdSense verification tag fix)

- Replaced next/script with a literal hoisted <script async> in the root layout: the exact AdSense snippet now appears in the <head> of every prerendered page (verified in out/index.html and tool pages) so Google's ownership verifier sees it in raw HTML.
- Owner next: push to GitHub (auto-deploys), wait a few minutes, then click Verify in AdSense, then Request review.
- Verified: tests 58/58 ✓ typecheck ✓ static export ✓ literal tag confirmed.

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