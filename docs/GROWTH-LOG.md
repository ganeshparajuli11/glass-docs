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
2. OCR: image to text (tesseract.js, fully in browser; self-host worker, core WASM and language data under public/ from npm packages, never a CDN; English first, Nepali and Hindi if size allows)
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
