# File Map

Application implemented at repository root (spec .md files live alongside it).

## Entry points & config

- `src/app/layout.tsx` — root layout: ThemeProvider, Aurora, Header/Footer, metadata defaults.
- `src/app/icon.svg` — browser/app icon served by the App Router for tab branding.
- `src/app/globals.css` — ALL design tokens (light/dark), glass surfaces, aurora, motion rules, article typography. Change colors here, not in components.
- `src/config/site.ts` — name/tagline/url. `src/config/ads.ts` — ad kill switch, placement config, client-id validation.
- `scripts/copy-pdf-worker.mjs` — copies pdf.js worker to `public/`; runs in dev/build scripts.

## Domain / engine (read before changing any operation)

- `src/lib/pdf/errors.ts` — error taxonomy + engine-error mapping.
- `src/lib/pdf/ranges.ts` — 1-based range parser → 0-based indices.
- `src/lib/pdf/validation.ts` — signature/size validation (PDF + images).
- `src/lib/pdf/contracts.ts` — ToolState/ProgressState unions.
- `src/lib/pdf/operations/` — pure pdf-lib ops: `load.ts` (safe load/save), `merge.ts`, `organize.ts` (reorder/rotate/delete/extract core), `split.ts`, `watermark.ts`, `page-numbers.ts`, `images-to-pdf.ts`, `metadata.ts`.
- `src/lib/pdf/pdfjs.ts` — lazy pdf.js adapter: openDocument, renderPageToCanvas, extractPageText, readDocumentInfo, destroyDocument.
- `src/lib/files/download.ts` — object-URL lifecycle (make/revoke/trigger). `format.ts` — sizes/names.

## Tool platform

- `src/lib/tools/registry.ts` — THE tool registry (13 tools; metadata, FAQs, limits). `validate.ts` — invariants (tested).
- `src/components/tool/` — `ToolHost.tsx` (slug→lazy component map), `ToolShell.tsx`, `FileDrop.tsx`, `FileList.tsx`, `PageOrganizer.tsx` (shared organizer foundation), `Panels.tsx` (progress/error/success), `Field.tsx`, `ToolCard.tsx`, `ToolSearch.tsx`, `ToolsExplorer.tsx`.
- `src/components/shell/BrandMark.tsx` — custom GlassDocs logo mark used by the header.
- `src/features/<tool>/` — one client component per tool; organize modes share `features/organize/OrganizeTool.tsx`.

## Pages & content

- `src/app/page.tsx` (home), `tools/page.tsx`, `tools/[slug]/page.tsx` (SSG + FAQ JSON-LD), `learn/…`, legal pages, `not-found.tsx`, `sitemap.ts`, `robots.ts`.
- `src/content/articles.tsx` — guide content (3 articles).
- `src/components/ads/AdSlot.tsx` — renders null when disabled; never used inside workspaces.
- `src/components/shell/` — Header, Footer, ThemeProvider, ThemeToggle, Aurora.

## Tests & CI

- `tests/unit/` — ranges, registry, validation, format, errors, ads.
- `tests/integration/operations.test.ts` — semantic golden tests for all pdf-lib ops.
- `tests/e2e/smoke.spec.ts` + `playwright.config.ts` — homepage/tool/search/no-upload journeys.
- `.github/workflows/ci.yml` — lint→typecheck→test→build, then Chromium smoke.

## Persistent state

- `.ai/*` as before. `VERSIONS_SNAPSHOT.md` — locked versions.
