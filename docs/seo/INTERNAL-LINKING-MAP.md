# Internal Linking Map — GlassTools

Date: 2026-07-18

## Link sources by page type (implemented)

| From | Links to | Mechanism |
|---|---|---|
| Homepage | 6 popular tools (cards), 5 category pages, 8 task links with descriptive anchors, 4 footer tools | page.tsx |
| Category pages (/pdf-tools etc.) | Every tool in the category + relevant guides | CategoryLanding.tsx |
| Tool pages | Category breadcrumb → /tools, 2–3 related tools (registry `relatedTools`), related guides (`toolGuides` map) | tools/[slug]/page.tsx |
| Guides | Their tools inline in steps, sibling guides where natural | articles.tsx content |
| Footer (sitewide) | 4 popular tools, /tools, /learn, legal | Footer.tsx |

## Anchor-text policy

Descriptive, task-shaped anchors ("Remove pages from a PDF", "Compress an image
for email"). Never "click here"/"learn more". Registry `name` +
`shortDescription` provide the card anchors.

## Density guard

Sitewide (header/footer) links stay under ~15; the 29 tools are NOT all in the
footer — discovery flows through /tools and category pages. Contextual links
only where the destination genuinely helps the current task.

## Full tool→guide map

See `toolGuides` in src/content/articles.tsx (19 tools mapped to 7 guides —
single source of truth; update there, not here).
