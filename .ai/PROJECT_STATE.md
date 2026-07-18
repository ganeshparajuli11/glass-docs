# Project State

Updated: 2026-07-18
Milestone: M3 — Core tool release (local build complete; admin/deploy pending)
Overall status: Application implemented and verified locally. All 13 MVP tools working. Supabase/admin, ads activation, and production deployment intentionally deferred (need user credentials/decisions).
Working codename: GlassDocs

## Current architecture

- Next.js 16 App Router, TypeScript strict, Tailwind CSS 4 (token-driven design system in `globals.css`).
- Fully static public app (29 prerendered routes; `next build` uses SSG for tool/article pages).
- Browser-local PDF processing: pdf-lib operations in `src/lib/pdf/operations/`, pdf.js adapter in `src/lib/pdf/pdfjs.ts` (worker served from `/public/pdf.worker.min.mjs`).
- Tool registry (`src/lib/tools/registry.ts`) is the single source of truth for routes, search, SEO, FAQs.
- AdSlot abstraction present, ads disabled by default; no AdSense script included.
- No Supabase yet; no secrets anywhere in the client.

## Implemented capabilities

All 13 MVP tools, stable, local-only: merge, split (3 modes), extract pages, rotate, reorder, delete pages, watermark (text), page numbers, images→PDF (JPG/PNG/WebP, EXIF-aware), PDF→images (PNG/JPEG, 3 resolutions), viewer, metadata & info editor, extract text.
Shared platform: glass design tokens (light/dark/reduced-motion), aurora background, header/footer shell, tool search, page-organizer foundation with thumbnails and keyboard controls, accessible file drop, progress/error/success panels with object-URL cleanup.
Content/SEO: homepage, tools index, 3 substantial guides, privacy/terms/cookies/about/contact drafts, sitemap.ts, robots.ts, FAQ JSON-LD on tool pages, metadata everywhere.
Quality: 42 unit+integration tests (vitest), Playwright config + smoke specs, GitHub Actions CI (lint→typecheck→test→build→e2e).

## Next objective

T-100+ (Supabase admin) or T-210 (deployment) — both require user accounts/credentials. Locally remaining: run Playwright E2E (blocked in build sandbox — no browser download allowed; CI covers it), deeper accessibility audit (T-200), performance/memory stress (T-202).

## Known decisions

See .ai/DECISIONS.md — notably: npm instead of pnpm; no web workers for pdf-lib ops in v1 (pdf.js has its own worker); WebP transcoded to PNG client-side; no zip download for multi-file outputs yet; metadata+info combined into one tool.

## Known blockers

- Playwright browsers cannot download inside the build sandbox (network allowlist). E2E runs via CI or on the developer machine.
- Supabase/admin (T-100/101), real ads (T-112/211), domain/hosting (T-210/211) need user credentials and decisions.
- Final brand/domain not selected; "GlassDocs" remains a codename.
