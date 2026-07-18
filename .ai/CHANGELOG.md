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

## 2026-07-18 (later) — Launch preparation
- Rebrand to GlassTools / glasstools.net.
- Static export mode (DEPLOY_TARGET=static) for Cloudflare Pages.
- AdSlot upgraded to real AdSense integration behind the existing kill switch (still off); ads.txt.example added.
- DEPLOYMENT_STEPS.md owner checklist added.

## 2026-07-18 (expansion) — 29-tool launch set
- New image tools: compressor, resizer, crop, converter, passport-photo sheet.
- New text tools: word counter, case converter, remove spaces, dedupe lines, compare.
- New calculators: GPA, assignment grade, attendance, percentage, EMI.
- New student tool: assignment cover-page generator.
- GlassTools logo/favicon; homepage category browsing; 6 category filters.

## 2026-07-18 (hardening) — Mobile + security pass
- 320px-safe shell, iOS-friendly inputs, overflow guards.
- Security/caching headers (_headers), JSON-LD escaping, input caps, SECURITY.md.

## 2026-07-18 (adsense) — Verification wiring
- Site-wide AdSense loader with real publisher ID; ads.txt published; CSP allows Google ad domains. Ad display still gated off.
