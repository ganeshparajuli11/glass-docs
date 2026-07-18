# Performance Audit — GlassTools

Date: 2026-07-18

## Architecture facts (why baseline is strong)

- Fully static HTML on Cloudflare edge → TTFB is CDN-fast worldwide.
- PDF engines (pdf-lib ~200KB gz, pdf.js ~350KB gz) load ONLY on their tool
  routes via next/dynamic — verified: homepage bundle contains no PDF code.
- pdf.js worker (1.2MB) served same-origin, cached 24h + SWR (see _headers);
  loads only when a pdf.js tool is opened.
- System font stack — zero font download, zero font CLS.
- /_next/static/* immutable-cached 1 year.
- AdSense loader is async + site-wide (verification requirement); ad units
  render nothing and reserve height when enabled → no ad CLS.
- Aurora background is pure CSS; disabled under prefers-reduced-motion.

## Expected Core Web Vitals

| Metric | Target | Expectation | Why |
|---|---|---|---|
| LCP | ≤2.5s | pass | static HTML, no hero image, no font swap |
| CLS | ≤0.1 | pass | no ads yet; reserved slots when enabled; no image reflow |
| INP | ≤200ms | pass on tool pages | heavy work is async/awaited; thumbnails render progressively |

## Measured

Lighthouse could not run in the build sandbox (no Chromium available —
network allowlist blocks the download). OWNER ACTION: after deploy run
PageSpeed Insights (https://pagespeed.web.dev) on: /, /tools/merge-pdf,
/tools/image-compressor, /learn/are-online-pdf-tools-safe — mobile first.
Paste scores into SEO-TEST-RESULTS.md. CI's Playwright job provides the
browser-level regression net going forward.

## Known watch-items

1. PageOrganizer thumbnails on 100+ page PDFs — budgeted (120 thumbs max) but
   watch INP on low-end phones.
2. pdf.js worker first-load on slow connections — consider prefetch on tool-page
   hover later; don't preload sitewide.
3. When ads go live: measure CLS again before/after; anchor/vignette formats stay off.
