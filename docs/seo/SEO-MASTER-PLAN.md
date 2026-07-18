# GlassTools SEO Master Plan

Date: 2026-07-18 · Site: https://glasstools.net · Scope: worldwide, English

Supporting documents:
[Technical audit](./TECHNICAL-SEO-AUDIT.md) · [Keyword research](./KEYWORD-RESEARCH.md) ·
[Content plan](./CONTENT-PLAN.md) · [Internal linking](./INTERNAL-LINKING-MAP.md) ·
[Structured data](./STRUCTURED-DATA-PLAN.md) · [Search Console](./SEARCH-CONSOLE-SETUP.md) ·
[Performance](./PERFORMANCE-AUDIT.md) · [Implementation log](./IMPLEMENTATION-LOG.md) ·
[Test results](./SEO-TEST-RESULTS.md)

## 1. Executive summary

GlassTools is a 29-tool, fully static, privacy-first utility site. Its SEO
strengths are structural: real working tools, genuine local-processing privacy
(verifiable in DevTools), instant CDN delivery, and honest content. Its
weaknesses are age (brand-new domain), missing highest-volume tools
(Word↔PDF, PDF compression), and zero existing authority. This plan ships the
complete technical foundation now, competes first on long-tail and
differentiated queries (passport sheets, student workflows, privacy-intent),
and sequences the high-volume tools as engineering work — never as thin pages.

Rankings are never guaranteed; everything here follows Google Search
Essentials.

## 2. Current audit → [TECHNICAL-SEO-AUDIT.md](./TECHNICAL-SEO-AUDIT.md)

All high-severity gaps found were fixed this session (canonicals, category
pages, structured data, guide linking). Two open items: OG images, analytics.

## 3. Positioning

"Everyday PDF, image & student tools — private by default." The privacy claim
is provable, the student angle (cover pages, GPA/attendance, submission
pipeline) is underserved by the big competitors, and both are kept factual.

## 4. Search opportunity

Big-head PDF terms (compress/convert) are dominated by Smallpdf, iLovePDF,
Adobe et al. — a new domain will not beat them head-on soon. Realistic entry:
(a) task-specific long-tail ("remove one page from pdf", "35x45 photo sheet"),
(b) privacy-intent queries where local processing is a real differentiator,
(c) student queries with tool+guide pairs. Volume plays come later, with the
compress-pdf tool as the first big build (see §22).

## 5. Google Trends protocol (owner runs; sandbox cannot)

At trends.google.com compare ≤5 terms, Worldwide + US/UK/IN/NP/PH/PK/BD/AU/CA/ZA,
timeframes 30d/12m/5y. Record top/rising/breakout related queries into
KEYWORD-RESEARCH.md. Treat values as relative interest; ignore news spikes;
never build pages off accidental correlations.

## 6–7. Keywords and intent → [KEYWORD-RESEARCH.md](./KEYWORD-RESEARCH.md)

One canonical page per cluster; variations handled in-page; four blocked
clusters explicitly deferred until their tools exist.

## 8. Competitors

Studied for intent patterns only (Smallpdf, iLovePDF, Sejda, PDF24, TinyWow,
PDF Candy, PDF2Go, Adobe online): all lead with the drop zone above the fold,
state limits, and cross-link aggressively within clusters — GlassTools now
does all three with stronger privacy honesty. Nothing was copied.

## 9. URL architecture (final)

Home / /tools (index+search) / 5 category pages at root (/pdf-tools,
/image-tools, /text-tools, /calculators, /student-tools) / tools at
/tools/<slug> / guides at /learn/<slug> / legal at root. Decision record for
keeping /tools/* in the audit doc. Lowercase, permanent, no dates in URLs.

## 10–11. Technical + tool-page requirements

Implemented: unique metadata + self-canonicals sitewide, one H1 per page,
breadcrumbs, processing badge, limits, FAQs, related tools + guides, last
reviewed date, error pages, sitemap (41 URLs), robots, security headers, all
truthful structured data. Tool interface stays above the fold; SEO content
below it.

## 12. Content → [CONTENT-PLAN.md](./CONTENT-PLAN.md) — 7 live guides, next wave gated on crawl data.

## 13. Internal linking → [INTERNAL-LINKING-MAP.md](./INTERNAL-LINKING-MAP.md).

## 14. Structured data → [STRUCTURED-DATA-PLAN.md](./STRUCTURED-DATA-PLAN.md).

## 15. Core Web Vitals → [PERFORMANCE-AUDIT.md](./PERFORMANCE-AUDIT.md) — expected green; owner measures live with PSI.

## 16. Mobile

320px-safe shell shipped in the prior hardening pass (44px targets, 16px
inputs, wrap guards). Owner: one real-device sweep of Tier-1 tools.

## 17. Accessibility

Landmarks, labels, aria-live progress, focus-visible, reduced-motion, keyboard
paths — implemented. Formal axe pass runs in CI (Playwright) — keep it green.

## 18. Trust / E-E-A-T

Live: /about /contact /privacy /terms /cookies + per-tool honest limits +
verifiable privacy claim. Owner gaps: real contact email (critical for both
E-E-A-T and AdSense), remove "Draft" labels after review. Future: /security
page consolidating SECURITY.md content publicly.

## 19. Ads

AdSense verification wired (3 methods). Display stays off until approval;
then only the three reserved placements (never above the tool on mobile, never
near downloads). Full rules in 04_UI_UX_AND_AD_PLACEMENT.md + _headers CSP.

## 20. Search Console → [SEARCH-CONSOLE-SETUP.md](./SEARCH-CONSOLE-SETUP.md) (owner, ~20 min + weekly 15 min).

## 21. Analytics

Recommend Cloudflare Web Analytics (cookieless, no consent banner, free):
dashboard → your site → enable. Add GA4 only if deeper funnels are ever needed
and consent UX is built first. Event allowlist rules live in
03_ARCHITECTURE §10 — no filenames/contents ever.

## 22. Roadmap

| When | What |
|---|---|
| Now (done) | Technical foundation, 29 tools, 7 guides, verification fix |
| +30 days | Owner: Search Console live, PSI measured, contact email, drafts reviewed, Trends data filled in; agent: fix anything Pages report flags; OG images |
| +60 days | Build compress-pdf (honest image-downsampling, before/after sizes) + its guide cluster — biggest unlocked keyword |
| +90 days | Evaluate Word→PDF feasibility spike (client-side docx rendering); next content wave from real query data; consider /security page |

## 23–24. 30/90-day plans — merged into §22 table.

## 25. KPIs (realistic for a new domain)

90-day: ≥35 indexed pages, first 1k impressions/mo, ≥5 queries in top-20,
CWV all green, tool completion rate ≥60% (analytics), zero manual actions.
NOT a KPI: "rank #1 for pdf compressor".

## 26. Risks

New-domain sandbox period (weeks of low impressions — normal); missing
big-head tools caps volume until built; AdSense review may demand more
content age; competitor brand strength. Mitigation = differentiation + patience,
not shortcuts.

## 27. Research sources

- Google AdSense eligibility: https://support.google.com/adsense/answer/9724 (fetched 2026-07-18)
- Ads.txt guide: https://support.google.com/adsense/answer/12171612 (2026-07-18)
- AdSense approval standards 2026: https://theguidex.com/google-adsense-approval/ (2026-07-18)
- Live-site inspection of glasstools.net (2026-07-18)
- Repository inspection (full, 2026-07-18)
- Google Trends: NOT yet run (owner protocol in §5) — priorities marked directional accordingly.

## 28. Status

Foundation: SHIPPED (pending owner git push). Owner actions listed in §20–22.
