# Growth Log — GlassTools

Daily automated contributor log. One meaningful improvement per day,
alternating **TOOL** days (build the next tool in the queue) and **SEO** days
(guides, internal links, metadata, audit fixes). The most recent entry decides
the next day's type: after a TOOL day comes an SEO day, and vice versa.

Rules: no page for a tool that does not genuinely work, no thin or
near-duplicate pages, no uploads or third-party processing, every check green
before pushing to main.

## Queue

Tool queue, in priority order (strike through when LIVE):

1. ~~Compress PDF~~ — LIVE 2026-10-23 (v2 follow-ups: CMYK/indexed images, per-page DPI — T-322)
2. ~~OCR: image to text~~ — LIVE 2026-10-25 (English, Nepali, Hindi; self-hosted tesseract.js 7)
3. OCR for scanned PDFs (pdf.js render + the OCR engine above; link from the "cannot copy text from PDF" guide)
4. HEIC to JPG/PNG
5. Remove EXIF / location data from photos
6. Protect PDF with a password / unlock a PDF with a known password (vetted library only)
7. Sign PDF (draw/type/upload signature, place on page)
8. PDF to Word, text-based (.docx keeping paragraphs and headings; complex layouts not preserved)
9. QR code generator; Markdown to PDF; image to Base64
10. Student kit: citation generator, deadline countdown, page/word estimator

SEO day priorities: (a) a substantial guide for a tool that has none yet
(start with the 16 newer image/text/calculator/student tools, backlog T-316,
then each newly built tool), wired into `toolGuides`; (b) internal links, FAQs,
metadata and JSON-LD for the newest tools and category pages; (c) anything the
SEO audit flags.

## Log

### 2026-10-26 — SEO — Photo-for-online-form guide + JPEG transparency fix

- New guide: **How to make a photo fit an online form** — the order that
  works for portal photos and signatures (crop to the shape → resize to exact
  pixels → JPG/PNG/WebP → under the KB limit), cm/DPI → pixels maths,
  1,000 vs 1,024-byte kilobytes, minimum-size limits, HEIC, renamed-file
  rejections, and a "portal still says no" checklist. Every tool behaviour
  described was checked against the code.
- Linked both ways: resizer, crop, converter and compressor pages list it;
  /image-tools lists it first; the email-shrinking guide points to it.
- Fix: JPEG output from the converter, resizer, crop and compressor turned
  transparent areas black (browser canvas default) even though the tools say
  white. Now flattened onto white; verified in Chromium.
- Tests: +3 (287 total). 58 pages audited, 0 problems.
- URLs added: https://glasstools.net/learn/resize-photo-for-online-form
- URLs changed: /tools/image-resizer, /tools/crop-image, /tools/image-converter,
  /tools/image-compressor, /image-tools, /learn/shrink-images-for-email, /learn

### 2026-10-25 — TOOL — Image to text (OCR)

- New tool: **Image to text (OCR)** — reads printed text from a JPG, PNG or
  WebP (drop, pick, or Ctrl/⌘+V paste a screenshot) with tesseract.js 7 in a
  Web Worker. English, Nepali and Hindi (`4.0.0_best_int` models), up to two
  at once. Small images are upscaled (≤2×), huge ones capped at 4000px, drawn
  on white so transparent PNGs read. Output is editable; "keep line breaks" or
  "join into paragraphs" (rejoins end-of-line hyphenation, keeps list items);
  confidence score with plain advice; copy or download .txt.
- Privacy: worker, WASM core and language data are copied from npm into
  public/ocr at build time (scripts/copy-ocr-assets.mjs, git-ignored) and
  served from glasstools.net — no CDN, the image never leaves the browser. CSP
  gains only `'wasm-unsafe-eval'` (WebAssembly compile; no JS eval). /ocr/*
  gets a 7-day cache header. New deps: tesseract.js (Apache-2.0),
  @tesseract.js-data/eng|nep|hin (MIT packages; models Apache-2.0); loaded
  only on the tool page via dynamic import.
- Content: long-form tool page (4 sections) + 5 FAQs; "cannot copy text from
  PDF" guide now gives a working on-device OCR route for scans (PDF to images →
  Image to text) instead of "no OCR yet"; Extract text page, error message,
  FAQ and limits point to OCR; "are online PDF tools safe" wording updated;
  /image-tools description and intro mention OCR; toolGuides wired.
- Tests: +20 (tests/unit/ocr.test.ts; 284 total) — language strings, paragraph joining,
  hyphen/list handling, Devanagari, confidence grading, progress labels,
  scaling; registry count 30→31. Browser check on out/ with the production
  CSP applied: sample PNG recognised exactly (95% confidence) at 1280px light
  and 320px dark, no horizontal scroll, eng+nep model load works, only
  same-origin /ocr/* requests. Console: sandbox-blocked AdSense loader plus two
  harmless Tesseract "Parameter not found" warnings when the Nepali model loads.
- URLs added: https://glasstools.net/tools/image-to-text
- URLs changed: /learn/cannot-copy-text-from-pdf, /learn/are-online-pdf-tools-safe,
  /tools/extract-text, /tools/pdf-to-images, /image-tools, /tools, /

### 2026-10-24 — SEO — Text clean-up guide + guide-page linking

- New guide: **How to clean up pasted text** — an order of operations
  (source → whitespace → case → duplicates → compare → count) with specific
  advice for PDF text (rejoining hard line breaks with find-and-replace,
  hyphen and ligature leftovers), spreadsheet columns and rows (tabs, when not
  to clean whitespace), and merged email lists (case sensitivity, first
  occurrence wins, blank lines, text-order sorting). States what no tool fixes.
- Four text tools that had no guide (case converter, remove extra spaces,
  remove duplicate lines, text compare) now link to it, plus word counter and
  extract text; /text-tools lists it; the "cannot copy text" guide links it.
- Every guide page now lists "Tools used in this guide" (two-way linking) and
  emits BreadcrumbList JSON-LD.
- Tests: +2 link-integrity tests. 56 pages audited, 0 problems.
- URLs added: https://glasstools.net/learn/clean-up-pasted-text
- URLs changed: all /learn/* guides, /text-tools, /tools/case-converter,
  /tools/remove-spaces, /tools/dedupe-lines, /tools/text-compare,
  /tools/word-counter, /tools/extract-text

### 2026-10-23 — TOOL — Compress PDF

- New tool: **Compress PDF** — finds raster images inside the PDF, downscales
  them (Light 2400px / Balanced 1600px / Strong 1100px longest edge) and
  re-encodes as JPEG with the browser's canvas. Text, fonts and vectors are
  untouched. Handles DCT (JPEG) and Flate images incl. PNG/TIFF predictors;
  skips CMYK/indexed/masked/colour-keyed images and tiny streams; keeps an
  image only if the replacement is ≤90% of the original; never hands back a
  larger file (reports "could not be made smaller" instead). EXIF APP1 is
  stripped before decoding so orientation matches what PDF viewers show.
- No new dependencies (pdf-lib only), no CSP change.
- Content: long-form tool page, 4 FAQs; "PDF too large to email" guide
  rewritten to use the tool (removed the old "no compressor yet" note);
  assignment guide links it; "Prepare an assignment" workflow ends with it;
  toolGuides wired both ways; PDF hub now 13 tools; homepage/tools counts
  derived from the registry.
- Tests: 25 new (byte helpers + pdf-lib integration with a fake recoder).
  Browser check: 1.6 MB sample → 424 KB (−72%), rendered output visually
  identical; text-only PDF correctly reports no reduction.
- URLs added: https://glasstools.net/tools/compress-pdf
- URLs changed: /learn/pdf-too-large-to-email, /learn/prepare-assignment-pdf-for-submission, /pdf-tools, /tools, /
