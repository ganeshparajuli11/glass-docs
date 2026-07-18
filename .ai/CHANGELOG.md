# Changelog

## 2026-07-18 — SPEC-001

- Created complete GlassDocs product/build specification.
- Added multi-agent roles and bounded work loop.
- Added persistent project-memory templates.
- Defined privacy-first MVP and deferred advanced conversions.
- Defined non-disruptive AdSense placements and admin configuration.
- Defined free-hosting portability strategy and production-term verification requirement.

## 2026-07-18 — Local MVP build (T-001..T-047, T-102 local, T-110/111)
- New: full GlassDocs application — 13 local PDF tools, glass design system with dark mode, tool search, guides, legal drafts, sitemap/robots/JSON-LD.
- New: PDF engine (pdf-lib + pdf.js adapters), error taxonomy, range parser, page organizer.
- New: 42 unit/integration tests, Playwright smoke specs, GitHub Actions CI.
- Ads: AdSlot abstraction present and disabled by default; no ad scripts load.

## 2026-07-18 — Branding refresh
- New: custom GlassDocs brand mark in the header instead of the generic file icon.
- New: app-router icon at `src/app/icon.svg` so the browser tab uses project branding.
- Changed: homepage browser title now matches the navbar brand exactly by using `site.name` as the default title.
