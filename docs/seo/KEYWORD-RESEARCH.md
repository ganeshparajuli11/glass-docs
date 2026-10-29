# Keyword Research — GlassTools

Date: 2026-07-18

## Research constraints (honest note)

Interactive Google Trends exploration could not be performed from this build
environment (Trends requires an interactive browser session). Priorities below
combine: (a) the owner-supplied seed list, (b) general search-demand knowledge
of the PDF-tools category, (c) live web research on AdSense/content standards
(sources in SEO-MASTER-PLAN.md §27). Treat Priority as directional. OWNER
ACTION: run the Trends protocol in SEO-MASTER-PLAN.md §5 and update the
Trend-direction column; then re-rank.

## Rule applied throughout

No page exists for a tool that does not work (site rule + Google helpful-content
principle). Word→PDF, PDF→Word, Compress PDF, Protect/Unlock PDF are the four
highest-demand seeds we deliberately did not target until built (Compress PDF went LIVE 2026-10-23; the other three remain build items) — they are build items,
not content items. Building thin "coming soon" pages for them would hurt trust
and indexing quality.

## Cluster table

| Keyword cluster | Intent | Priority | Trend direction | Target URL | Page type | Status |
|---|---|---:|---|---|---|---|
| merge pdf / combine pdf | Direct tool | 1 | TODO Trends | /tools/merge-pdf | Tool | LIVE |
| split pdf / extract pdf pages | Direct tool | 1 | TODO | /tools/split-pdf, /tools/extract-pages | Tool | LIVE |
| remove/delete pages from pdf | Direct task | 1 | TODO | /tools/delete-pages | Tool | LIVE |
| jpg to pdf / image to pdf | Direct tool | 1 | TODO | /tools/images-to-pdf | Tool | LIVE |
| pdf to jpg / pdf to png | Direct tool | 1 | TODO | /tools/pdf-to-images | Tool | LIVE |
| rotate pdf | Direct tool | 2 | TODO | /tools/rotate-pdf | Tool | LIVE |
| organise/reorder pdf pages | Direct tool | 2 | TODO | /tools/reorder-pages | Tool | LIVE |
| watermark pdf | Direct tool | 2 | TODO | /tools/watermark-pdf | Tool | LIVE |
| add page numbers to pdf | Direct task | 2 | TODO | /tools/page-numbers | Tool | LIVE |
| image compressor / compress image | Direct tool | 2 | TODO | /tools/image-compressor | Tool | LIVE |
| image resizer |3 | Direct tool | TODO | /tools/image-resizer | Tool | LIVE |
| webp to jpg / jpg to png | Direct tool | 3 | TODO | /tools/image-converter | Tool | LIVE |
| passport photo maker | Direct tool | 2 | TODO | /tools/passport-photo | Tool | LIVE (differentiator — low competition) |
| word counter | Direct tool | 3 | TODO | /tools/word-counter | Tool | LIVE |
| gpa calculator | Direct tool | 3 | TODO | /tools/gpa-calculator | Tool | LIVE |
| attendance calculator | Student | 3 | TODO | /tools/attendance-calculator | Tool | LIVE |
| emi calculator | Direct tool | 3 | TODO | /tools/emi-calculator | Tool | LIVE |
| is online pdf converter safe | Privacy | 2 | TODO | /learn/are-online-pdf-tools-safe | Guide | LIVE |
| how to remove pages from pdf | How-to | 2 | TODO | /learn/remove-pages-from-pdf | Guide | LIVE |
| compress photo for email | How-to | 2 | TODO | /learn/shrink-images-for-email | Guide | LIVE |
| assignment cover page | Student | 2 | TODO | /tools/cover-page (+ guide) | Tool | LIVE (differentiator) |
| clean up pasted text / remove duplicate lines / remove extra spaces | How-to | 3 | TODO | /learn/clean-up-pasted-text (+ 4 text tools) | Guide | LIVE (2026-10-24) |
| resize photo for online form / photo 200x230 / signature size kb / reduce photo size to 50kb | How-to | 2 | TODO | /learn/resize-photo-for-online-form (+ resizer, crop, converter, compressor) | Guide | LIVE (2026-10-26) |
| how many classes can i miss / 75% attendance / attendance percentage formula / classes needed for 75 | How-to | 2 | TODO | /learn/attendance-percentage-classes-you-can-miss (+ attendance, percentage calculators) | Guide | LIVE (2026-10-28) |
| word to pdf converter | Direct tool | BLOCKED | TODO | (future /tools/word-to-pdf) | Tool | NOT BUILT — needs conversion engine research |
| pdf to word converter | Direct tool | BLOCKED | TODO | (future) | Tool | NOT BUILT — layout reconstruction ± OCR |
| compress pdf / pdf compressor / reduce pdf size | Direct tool | 1 | TODO | /tools/compress-pdf (+ /learn/pdf-too-large-to-email) | Tool | LIVE (2026-10-23) — client-side image downsampling + JPEG re-encode; honest before/after sizes |
| image to text / ocr / photo to text / screenshot to text / nepali ocr / hindi ocr | Direct tool | 1 | TODO | /tools/image-to-text (+ /learn/cannot-copy-text-from-pdf) | Tool | LIVE (2026-10-25) — self-hosted tesseract.js, English/Nepali/Hindi, nothing uploaded |
| ocr pdf / ocr scanned pdf / scanned pdf to text / pdf ocr | Direct tool | 1 | TODO | /tools/ocr-pdf (+ /learn/cannot-copy-text-from-pdf) | Tool | LIVE (2026-10-27) — pdf.js render at ~300 DPI + self-hosted tesseract.js, uses real text layer where present, ≤50 pages/run, nothing uploaded |
| remove exif / remove location from photo / remove gps from photo / strip photo metadata / exif viewer | Direct tool | 2 | TODO | /tools/remove-exif | Tool | LIVE (2026-10-29) — lossless byte-level JPEG/PNG/WebP cleaner, keeps rotation flag, shows what was found, nothing uploaded |
| heic to jpg / heic converter | Direct tool | BLOCKED | TODO | (future) | Tool | NOT BUILT — browser HEVC decoders are LGPL-3.0; owner decision |
| password protect / unlock pdf | Direct tool | BLOCKED | TODO | (future) | Tool | Needs vetted browser crypto implementation |

## Cannibalisation guards

One canonical page per cluster. Variations ("combine pdf", "pdf merger",
"join pdf") are handled inside /tools/merge-pdf via keywords + natural copy —
no /merge-pdf-free, /combine-pdf duplicates. Registry keywords power on-site
search for the same variations.

## Geography note

English worldwide first. Nepal/India-relevant details already present where
they matter organically (passport 35×45mm preset, EMI terminology, attendance
percentage culture). No geo-doorway pages.
