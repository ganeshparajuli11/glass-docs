# Structured Data Plan — GlassTools

Date: 2026-07-18 · All JSON-LD, all < escaped, all truthful.

| Type | Where | Fields | Honesty notes |
|---|---|---|---|
| WebSite | Homepage | name, url | — |
| Organization | Homepage | name, url, logo | — |
| BreadcrumbList | Tool + category pages | Tools → page | matches visible breadcrumb |
| WebApplication | Every tool page | name, url, applicationCategory=UtilitiesApplication, operatingSystem, price 0 | price 0 is real; NO ratings/reviews/download counts (we have none) |
| FAQPage | Tool pages | registry FAQ (visible on page) | questions rendered visibly; not markup-only |
| CollectionPage | 5 category pages | name, description, url | — |
| Article | 7 guides | headline, description, datePublished 2026-07-18, org author | date = real publish date |

Explicitly NOT used: AggregateRating, Review, HowTo (Google restricted its
display eligibility; steps live as visible content instead), VideoObject.

## Validation

OWNER ACTION after deploy (needs live URLs):
1. https://search.google.com/test/rich-results — test /, /tools/merge-pdf, /learn/are-online-pdf-tools-safe, /pdf-tools
2. https://validator.schema.org — same URLs
Record results in SEO-TEST-RESULTS.md. Rich results are never guaranteed;
markup is for eligibility only.
