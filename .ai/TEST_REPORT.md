# Test Report

## Latest full verification
- Date: 2026-07-18
- Commit: (pre-git) local build
- Node/package manager: Node 22 LTS / npm 10.9.8
- lint: PASS (eslint, 0 problems)
- typecheck: PASS (tsc --noEmit, strict)
- unit: PASS (58 total incl. text/calc/layout/cover-page suites; previously 25: ranges, registry, validation, format, errors, ads)
- integration: PASS (17 tests: merge/organize/split/watermark/page-numbers/images-to-pdf/metadata semantic verification via pdf-lib re-parse)
- E2E Chromium: NOT RUN (browser download blocked by sandbox network allowlist; CI job configured)
- E2E Firefox/WebKit: NOT RUN
- accessibility: automated axe suite NOT RUN; components built with landmarks, labels, live regions, focus-visible, 44px targets, reduced-motion
- build: PASS (next build, 29 static routes)
- performance: budgets not yet measured; engines are lazy-loaded per tool via next/dynamic, homepage imports no PDF code

## Task-level verification
### Branding refresh
- `npm run build` — PASS; Next emitted `/icon.svg` and compiled the new `BrandMark` header component without type or build errors.
- `npm run build` — PASS; default metadata title now resolves directly from `site.name`, matching the navbar brand on the homepage.

### PDF operations (T-041..T-047)
- Fixtures generated in-test with pdf-lib (mixed sizes, rotations); outputs re-parsed and asserted on page count, order, dimensions, rotation angles, metadata.
- Invalid input (garbage bytes, out-of-range instructions, empty instruction list, non-WinAnsi watermark text) maps to safe ToolError codes.

### HTTP smoke (production server)
- next start + curl: 11 representative routes all 200 with expected marker content.

## Not yet tested
- Real-browser journeys (Playwright) — owner: QA, run on dev machine or CI.
- axe accessibility scans — owner: QA (T-200).
- Memory stress fixtures (100+ pages, 20 hi-res images) — owner: QA/PDF engine (T-202).
- pdf.js-dependent flows (viewer, thumbnails, text extraction, PDF→images) have no node tests by nature; covered only by manual/E2E.
