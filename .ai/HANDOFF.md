# Current Handoff

Updated: 2026-07-18 Asia/Kathmandu
Milestone: M3 (core tools) complete locally
Repository state: uncommitted (git not initialized in this folder yet — run `git init && git add -A && git commit -m "feat: GlassDocs MVP local build"`)

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
- pdf-lib operations run on the main thread (documented decision ADR-002); fine for recommended sizes, revisit with Web Worker bridge if large-file jank is observed.
- Contact page has no address yet; legal pages are marked drafts.

## Do not redo

- Do not reintroduce Office conversion, OCR, or compression into MVP.
- Do not add ads inside the tool workspace; AdSlot already enforces disabled-by-default.
- Do not switch package manager away from npm without reason.
- Design tokens, registry shape, error taxonomy, and operations API are settled — extend, don't rewrite.
