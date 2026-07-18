# Feature Catalog and Roadmap

## 1. Feasibility categories

### Local-stable candidate

Can be implemented in the browser with established libraries and verified output.

### Local-experimental

Possible with browser/WASM techniques, but requires heavier testing, licensing review, or honest limitations.

### Backend-later

Requires server software, significant compute, or higher-fidelity conversion than a browser-only implementation can promise.

## 2. MVP tool matrix

| Tool | Mode | Primary engine | MVP | Important tests |
|---|---|---|---:|---|
| Merge PDF | Local | pdf-lib + worker | Yes | order, mixed page sizes, metadata, large multi-file |
| Split PDF | Local | pdf-lib | Yes | ranges, one-page outputs, invalid ranges |
| Rotate pages | Local | pdf-lib | Yes | 90/180/270, selected pages |
| Reorder pages | Local | pdf-lib | Yes | keyboard/drag order, duplicates prevented |
| Delete pages | Local | pdf-lib | Yes | cannot delete all without warning |
| Extract pages | Local | pdf-lib | Yes | selected order, output validation |
| Text watermark | Local | pdf-lib | Yes | opacity, position, rotation, Unicode limitations |
| Page numbers | Local | pdf-lib | Yes | placement, start number, page range, mixed sizes |
| Images to PDF | Local | browser image APIs + pdf-lib | Yes | EXIF orientation, multiple sizes, margin/fit |
| PDF to images | Local | PDF.js + canvas + worker | Yes | resolution, format, multi-page download strategy |
| PDF viewer | Local | PDF.js | Yes | zoom, page navigation, invalid/encrypted docs |
| Metadata viewer/editor | Local | pdf-lib/PDF.js | Yes | preserve document, unsupported metadata |
| Extract text | Local | PDF.js | Yes | text PDF, empty/scanned PDF message |
| PDF information | Local | PDF.js | Yes | pages, dimensions, version where available |

## 3. MVP tool requirements

Every tool needs:

- registry record;
- route and metadata;
- privacy label;
- accepted-file validation;
- recommended file-size guidance;
- cancellable processing where meaningful;
- progress stages;
- success summary;
- output validation;
- unit tests;
- golden-file integration tests;
- Playwright happy path and one failure path;
- FAQ based on actual limitations;
- related tools;
- analytics events without document data.

## 4. Detailed MVP behaviors

### Merge PDF

- Multiple PDFs.
- Reorder files before processing.
- Optional source-file bookmarks are not promised.
- Preserve page dimensions and rotation.
- Default output filename derived generically, not from all source names.

### Split PDF

Modes:

- extract one combined PDF from ranges;
- create separate PDFs per selected range;
- split every page.

Range parser supports examples such as `1-3, 5, 8-10` and reports exact invalid tokens.

### Rotate, reorder, delete, extract

Share a page-organizer foundation. Build it once and configure capabilities rather than cloning UI four times.

### Watermark

MVP supports text watermark only:

- text;
- font size;
- opacity;
- angle;
- position/pattern;
- page selection.

Do not promise perfect coverage for every writing system until font embedding has been tested.

### Page numbers

- top/bottom positions;
- alignment;
- start number;
- prefix/suffix;
- page selection;
- skip first N pages.

### Images to PDF

- JPG, PNG, WebP where browser decode supports it.
- preserve orientation;
- page size: auto, A4, Letter;
- fit: contain, cover, original;
- margins;
- image quality setting only if re-encoding occurs.

### PDF to images

- PNG and JPEG.
- scale/resolution presets.
- for multi-page output, download individual files or a ZIP only after a reviewed ZIP dependency is added.
- warn about memory for high-resolution large documents.

### Extract text

- identify when no selectable text is found;
- clearly suggest that OCR is a future/server capability;
- allow copy and `.txt` download;
- do not send extracted text to analytics.

## 5. Phase 1.5 — only after research spikes

### Basic compression

Possible techniques:

- rasterize image-heavy pages at a selected quality;
- downsample embedded images where supported;
- remove unneeded metadata.

Risks:

- output can be larger;
- text/search/accessibility can be lost if rasterized;
- quality can degrade;
- forms/links/annotations may be lost.

Therefore, label modes honestly, show before/after size, and keep original locally available until download.

### Encryption/protection and unlock

Do not implement with an unreviewed package simply to fill a card. Run a research task covering browser support, encryption standard, license, maintenance, interoperability, and security. If no acceptable implementation is found, keep it planned for a backend.

### Forms

A simple form-inspection/fill tool may be possible, but flattening, signatures, XFA forms, and advanced validation require separate support statements.

## 6. Phase 2 — backend or specialized compute

- OCR for scanned PDFs.
- High-quality compression.
- PDF repair.
- Password protection/unlock if not safely local.
- PDF/A conversion and validation.
- Document redaction with true content removal.
- Advanced annotation.
- Batch jobs.

Use queued jobs, strict deletion periods, malware scanning, encrypted transport, and explicit consent if files leave the browser.

## 7. Phase 3 — Office document conversions

### Word/DOCX to PDF

Pixel-perfect conversion normally depends on a document-rendering engine and fonts. Browser HTML previews are not equivalent. Implement later through an isolated conversion worker/service and show fidelity limits.

### PDF to Word

This is document reconstruction, not simple conversion. It may require layout analysis, OCR, font mapping, tables, and images. Do not ship a poor text dump under this name.

### Excel/PowerPoint

Handle as separate products with format-specific test suites. Avoid enabling macros or active content.

## 8. Phase 4 — accounts and paid features

Only after proven traffic:

- optional accounts;
- job history for server tools;
- batch processing;
- larger limits;
- API access;
- team workspaces;
- cloud storage integrations.

Local tools should not require login.

## 9. Content roadmap

For every stable tool, create one useful guide:

- what the operation does;
- common mistakes;
- privacy behavior;
- file-size guidance;
- step-by-step use;
- alternatives for unsupported cases;
- related tools.

Do not mass-produce repetitive articles solely for ad inventory.

## 10. Task sequence

Recommended feature order:

1. Shared shell and tool framework.
2. PDF viewer and validation foundation.
3. Page organizer.
4. Merge.
5. Split/extract.
6. Rotate/reorder/delete.
7. Images to PDF.
8. PDF to images.
9. Watermark/page numbers.
10. Metadata/info/text extraction.
11. Admin configuration.
12. SEO/legal/ads.
13. full QA and deployment.

---

**Next read:** `06_ADMIN_AND_CONNECTORS.md`
