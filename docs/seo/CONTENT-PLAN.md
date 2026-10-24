# Content Plan — GlassTools

Date: 2026-08-12

## Per-tool page content (all 29 tools)

`src/content/tools/` holds hand-written content for every tool page: a lede, a
how-to sequence matching the tool's real controls, and 3–4 explanatory sections
(choosing settings, pitfalls, when to use something else). Roughly 500–650
unique words per page.

Written in response to the AdSense "Low value content" decision: a tool page
carrying a one-line description and one FAQ entry is thin whatever the tool
does. `tests/seo/tool-content.test.ts` enforces a floor and rejects reused
headings, so the next tool cannot ship as a stub.

## Published (12 guides, all linked two-way with tools)

| Guide | Cluster | Serves intent |
|---|---|---|
| /learn/merge-pdfs-without-uploading | PDF management | how-to + privacy |
| /learn/split-pdf-page-ranges | PDF management | how-to |
| /learn/remove-pages-from-pdf | PDF management | how-to (delete/extract) |
| /learn/images-to-pdf-quality | Image→PDF | how-to + quality |
| /learn/shrink-images-for-email | Image | troubleshooting ("attachment too large") |
| /learn/are-online-pdf-tools-safe | Trust | privacy/security (supports every tool) |
| /learn/prepare-assignment-pdf-for-submission | Student | student workflow (differentiator) |
| /learn/rotate-one-page-in-a-pdf | PDF management | how-to (partial rotation) |
| /learn/pdf-too-large-to-email | PDF troubleshooting | "attachment too large", honest about the missing compressor |
| /learn/cannot-copy-text-from-pdf | PDF troubleshooting | scan vs digital PDF, OCR gap |
| /learn/passport-photo-sizes-explained | Image | supports the passport-sheet differentiator |
| /learn/gpa-scales-explained | Student | calculator cluster |
| /learn/clean-up-pasted-text | Text | text-tool cluster workflow (2026-10-24) |

## Writing rules (enforced)

Answer near the top; steps numbered; tool linked in the first section; limits
stated honestly; no "100% secure/perfect/best" claims; no year-stuffed URLs;
FAQ only where genuinely useful and visible.

## Next content wave

1. Why fonts change when converting documents (prepares Word→PDF launch).
2. How PDF compression works (publish TOGETHER WITH the compress tool, never
   before — `/learn/pdf-too-large-to-email` currently states the gap honestly).
3. Scanning settings that keep a document readable and small (DPI, greyscale).
4. ~~Text-tool cluster: cleaning data pasted out of a spreadsheet.~~ Done 2026-10-24.
5. Calculator cluster: attendance (75% rules), EMI, percentage change.

## Never

Mass-generated variants, competitor-brand targeting, pages for non-working tools.
