# Current Handoff

## Session update (2026-10-30, daily contributor — SEO day: loan EMI guide)

- New guide /learn/loan-emi-calculation-compare-loans (16 guides): formula + worked example, payment split (incl. 3M/9%/20y home-loan example), term and rate tables, flat vs reducing (11% flat ≈ 18.8% reducing; 1.5–1.85× rule for 1–7 y, 6–20%), prepayment keep-EMI vs keep-term, what EMI excludes, comparison checklist.
- src/lib/calc/emi.ts gains pure `emiSchedule` and `monthsToRepay` (not yet used by the UI — a year-by-year breakdown on the tool would be a good small follow-up). tests/unit/emi-guide.test.ts pins every number in the guide.
- Registry: +3 EMI FAQs. study.tsx EMI content links the guide. toolGuides emi-calculator + percentage-calculator; /calculators guideSlugs. New test in tests/seo/registry.test.ts: every tool links to ≥1 guide. T-316 Done.
- Verified: npm run verify ✓ (352 tests) · build:static ✓ · audit 62 pages 0 problems ✓ · Playwright on out/: 320 dark + 1280 light, no h-scroll, Article + BreadcrumbList JSON-LD, links on emi/percentage tools, /calculators, /learn; calculator at 18.8% shows 12,915.31. Only console errors = sandbox-blocked AdSense loader.
- Next: TOOL day — Protect/unlock PDF (queue 6) unless the owner unblocks HEIC (T-326). Following SEO day: (b) internal links/FAQs/JSON-LD for newest tools (remove-exif, ocr-pdf), or a guide for removing photo location data.

## Session update (2026-10-29, daily contributor — TOOL day: Remove EXIF & location data)

- Queue item 4 (HEIC to JPG/PNG) SKIPPED, not built: every browser HEIC decoder (libheif-js, heic-to, and the libheif bundled inside heic2any/heic-decode) is LGPL-3.0 because HEVC decoding comes from libde265; the queue rule allows only MIT/Apache/BSD-style deps, and Chrome/Firefox cannot decode HEIC natively. OWNER DECISION needed (accept an LGPL WASM module loaded only on its page, or drop the item). Left in the queue marked BLOCKED.
- Shipped queue item 5 instead: /tools/remove-exif "Remove EXIF & location data" (33 tools live, image hub 8). Logic: src/lib/image/metadata.ts — pure, lossless byte-level cleaner (no decode/re-encode). JPEG: drops APP1 EXIF/XMP, APP2 non-ICC (MPF/FPXR), APP3–13/15, COM and everything after EOI (motion-photo video, gain maps); keeps JFIF APP0, ICC APP2, Adobe APP14; scans entropy data correctly (stuffed FF00, RSTn, progressive multi-SOS). PNG: keeps a render whitelist (IHDR/PLTE/IDAT/IEND/tRNS/gAMA/cHRM/sRGB/iCCP/sBIT/bKGD/pHYs/hIST/sPLT/cICP/mDCV/cLLI/APNG) + unknown critical chunks; drops eXIf/tEXt/zTXt/iTXt/tIME/other ancillary; CRC32 implemented. WebP: drops EXIF/"XMP " and unknown chunks, clears VP8X flags, fixes RIFF size. Option "Keep the rotation flag" (default on) writes back a 26-byte orientation-only TIFF (JPEG APP1 / PNG eXIf after IHDR / WebP EXIF chunk + flag). TIFF parser (parseExif) reads make/model/lens/software/dates/artist/copyright/owner/serial/GPS (DMS→decimal, altitude)/thumbnail; never throws, loop-guarded. describeFindings() → plain-language list, sensitive first. HEIC/AVIF detected (ftyp brand) with a specific message.
- UI: src/features/remove-exif/RemoveExifTool.tsx — up to 20 files, magic-byte detection (not file.type), per-photo preview + before/after size + "Found and removed" dl (private items get an icon + sr-only "Private:"), Download / Download all (350 ms spacing), "Already clean" state, reprocesses on option toggle, object URLs revoked.
- Content: 5-section tool content + 5 FAQs; /image-tools description + intro paragraph; are-online-pdf-tools-safe gains a photo-metadata rule linking the tool; toolGuides "remove-exif" → are-online-pdf-tools-safe, shrink-images-for-email. Registry engine union gains "byte-level". No new deps, no CSP change.
- Tests: +20 unit (tests/unit/image-metadata.test.ts, fixtures tests/fixtures/metadata.ts generated with Pillow 12), registry 32→33 + 3 search assertions; 337 total. Cross-checked with Pillow out of band: pixels identical for baseline, progressive and restart-marker JPEGs, PNG and WebP; EXIF reduced to {274: n} or {}.
- Verified: npm run verify ✓ · build:static ✓ · audit 61 pages 0 problems ✓ · Playwright on out/ (serve /tools/remove-exif.html — python http.server 301s the extensionless path to the directory listing) with production CSP: 6 files (JPEG+GPS, progressive JPEG, PNG, WebP, fake HEIC, plain WebP) → correct findings, GPS 27.70833° N 85.32400° E 1400 m, downloads clean (orientation-only / none, pixels identical), 320 dark + 1280 light, no h-scroll. Only console errors = sandbox-blocked AdSense loader.
- Next: SEO day — EMI guide (last T-316 item). Following TOOL day: Protect/unlock PDF (queue 6) unless the owner unblocks HEIC.

## Session update (2026-10-28, daily contributor — SEO day: attendance guide)

- New guide /learn/attendance-percentage-classes-you-can-miss (15 guides): current %, classes needed, classes you can miss, per-absence cost table (60–90%) + 60-class term allowance, end-of-term ceiling check (uses percentage calculator's "Part as % of Whole" row), rounding (74.5%), regulation checklist, 5-step routine. tests/unit/attendance-guide.test.ts pins every number in the guide to src/lib/calc/attendance.ts + percentage.ts.
- Fix: attendance tool content claimed the "can miss" buffer shrinks with every class held whether you attend or not — false; attending adds (1 − r)/r. Corrected in src/content/tools/study.tsx, which now links to the guide.
- Wired: toolGuides attendance-calculator (guide first) + percentage-calculator (first guide); categories /calculators + /student-tools guideSlugs. Registry FAQs: +3 attendance, +1 percentage.
- CSS: `.article-body` table styles + `.table-wrap` (overflow-x auto; give it role="region" aria-label tabIndex={0} so the scroll box is keyboard-reachable). Verified 320px: table fits (246/246), no page h-scroll.
- Verified: npm run verify ✓ (314 tests) · build:static ✓ · audit 60 pages 0 problems ✓ · Playwright on out/: 320 dark + 1280 light, Article + BreadcrumbList JSON-LD, tool pills, links present on both calculators, /calculators, /student-tools, /learn, sitemap. Only console error = sandbox-blocked AdSense loader.
- T-316 left: EMI calculator (only tool without any guide).
- Next: TOOL day — HEIC to JPG/PNG (queue item 4). Following SEO day: EMI guide (T-316 last item).

## Session update (2026-10-27, daily contributor — TOOL day: Scanned PDF to text OCR)

- Shipped /tools/ocr-pdf "Scanned PDF to text (OCR)" (32 tools live, PDF hub 14). Logic: src/lib/ocr/pdf.ts (pure: pdfOcrScale ~300 DPI capped at 4000 px, selectOcrPages empty=all / ≤50 pages per run with an explicit message, textFromItems rebuilds lines from pdf.js hasEOL, hasUsableTextLayer ≥40 letters/marks/digits so "Scanned with…" footers don't count, combinePageTexts with "--- Page N ---" markers, summarisePdfOcr char-weighted confidence). UI: src/features/ocr-pdf/OcrPdfTool.tsx — page range, "use the PDF's own text" toggle (default on; mixed PDFs copy real text exactly), languages, line-break mode, page markers, Cancel keeps pages already read, editable result, copy/.txt. Reuses src/lib/ocr/engine.ts (tesseract.js worker kept until languages change).
- BUG FIX (sitewide): pdf.js 6 decodes CCITT fax / JBIG2 / JPEG 2000 via WebAssembly loaded from `wasmUrl`, which was never set — black-and-white scanner PDFs rendered BLANK in the viewer, PDF to images and OCR. scripts/copy-pdf-worker.mjs now copies pdfjs-dist/wasm decoders + licences into public/pdfjs/wasm (git-ignored); openDocument passes wasmUrl. ADR-009. Verified: blocking /pdfjs/wasm/* reproduces the blank page; with it, the CCITT page OCRs exactly and PDF to images renders it.
- Content: long-form tool content (5 sections) + 5 FAQs; extract-text limitation/FAQ/error/hint/content now point to the new tool; image-to-text FAQ + section updated; cannot-copy-text guide's "If it is a scan" rewritten around the tool (manual crop route kept for two-column pages); /pdf-tools description count derived from registry + new intro paragraph; toolGuides wired.
- Tests: +17 (tests/unit/ocr-pdf.test.ts) +registry 31→32 and search assertions; 307 total. Verified: npm run verify ✓ · build:static ✓ · audit 59 pages 0 problems ✓ · Playwright on out/ with production CSP: 2-page JPEG scan read exactly (95%), mixed PDF (typed page via text layer + scanned page via OCR), CCITT G4 scan, forced-OCR mode, cancel, 320px dark no h-scroll; only external request/console error = sandbox-blocked AdSense loader.
- CI follow-up: e2e `header menus … a category menu opens` failed on CI (and on the previous commit's code locally) because `npm run dev` compiles /tools/split-pdf on first click — >5 s on a cold cache with 2 workers. Gave that one toHaveURL a 30 s timeout; reproduced the failure and 2× green locally with the preinstalled Chromium (temporary config with executablePath, not committed).
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