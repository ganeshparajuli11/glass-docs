# Google Search Console Setup — glasstools.net

Date: 2026-07-18 · All steps are OWNER actions (need your Google account).

## One-time setup

1. https://search.google.com/search-console → Add property → **Domain** → `glasstools.net`.
2. Copy the TXT record Google shows. Cloudflare dashboard → glasstools.net →
   DNS → Add record → Type TXT, Name `@`, Content = pasted value → Save.
   Back in Search Console press Verify (DNS can take minutes–hours).
3. Sitemaps (left menu) → enter `sitemap.xml` → Submit.
4. URL Inspection → paste `https://glasstools.net/` → Request indexing.
   Repeat for: /tools, /pdf-tools, /tools/merge-pdf, /tools/images-to-pdf,
   /tools/delete-pages, /learn/are-online-pdf-tools-safe. (Quota is limited —
   these seven are enough; the sitemap covers the rest.)

## Weekly 15-minute routine

| Check | Where | Act on |
|---|---|---|
| Impressions/clicks/CTR/position | Performance | note trend only; don't react to single days |
| Indexed vs not-indexed | Pages | fix any "Crawled - not indexed" tool page by improving its content, not by resubmitting |
| Core Web Vitals | Experience | investigate any "Poor" URL group |
| Queries at positions 8–20 | Performance → filter | these pages get content/link improvements first — biggest wins |
| Two pages ranking for one query | Performance → query → pages | consolidate: canonical one, de-optimise the other |
| Manual actions / Security | left menu | should always be empty; act immediately if not |

## Rules

Change one major variable at a time and give it 2–4 weeks. Never buy links.
Expect weeks of near-zero impressions for a new domain — that is normal, not failure.
