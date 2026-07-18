# SEO Implementation Log

## 2026-07-18 — Foundation pass (this session)

Code changes:
- src/lib/seo/meta.ts — canonical/OG/Twitter builder; applied to every page.
- 5 category landing pages (/pdf-tools /image-tools /text-tools /calculators
  /student-tools) with real intro copy, tool grids, guide links, CollectionPage
  + BreadcrumbList JSON-LD; homepage category cards now target them.
- Structured data: WebSite+Organization (home), BreadcrumbList + WebApplication
  (all 29 tool pages, joined with existing FAQPage), Article (7 guides).
- 4 new guides (safety, remove-pages, shrink-images, assignment-pipeline);
  toolGuides map → "Related guides" section on 19 tool pages.
- Homepage: unique metadata + canonical, "Jump straight to a task" descriptive
  anchors, category links.
- Tool pages: canonical + OG/Twitter, "Last reviewed" date from registry.
- Sitemap: +5 category routes (now 41 URLs).
- AdSense: google-adsense-account meta tag added (3rd verification method).

Deliberately NOT done (with reasons):
- No pages for word-to-pdf / pdf-to-word / compress-pdf / protect-pdf — tools
  don't exist; pages would violate the "working tool first" rule.
- No URL migration of /tools/* to root — churn without evidence (see audit).
- No hreflang/i18n — English-only until human translations exist.
- No OG images — needs design asset; backlog.
- No analytics code — Cloudflare Web Analytics is an owner dashboard toggle.
