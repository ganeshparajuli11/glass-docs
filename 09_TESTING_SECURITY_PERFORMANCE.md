# Testing, Security, Privacy, and Performance

## 1. Quality strategy

A PDF tool is correct only when its output opens and matches the requested transformation. A green component snapshot is not enough.

Testing layers:

1. pure unit tests;
2. engine integration tests with fixtures;
3. golden-file/output inspection;
4. component interaction tests;
5. Playwright user journeys;
6. accessibility checks;
7. performance and memory checks;
8. privacy/network checks;
9. deployment smoke tests.

## 2. Fixture library

Create legal, synthetic fixtures:

- one-page PDF;
- multi-page PDF with mixed portrait/landscape sizes;
- rotated pages;
- text and image pages;
- forms/annotations sample;
- Unicode text sample;
- blank pages;
- high-page-count lightweight PDF;
- image-heavy PDF;
- encrypted PDF for unsupported behavior;
- malformed/truncated PDF;
- zero-byte file;
- file with misleading `.pdf` extension;
- JPG/PNG/WebP in varied orientation and dimensions.

Do not include real private documents.

## 3. Unit tests

Cover:

- page-range parser;
- option schemas;
- file validators;
- output filenames;
- tool registry validation;
- state transitions;
- analytics redaction;
- ad placement eligibility;
- configuration precedence;
- error mapping.

## 4. Engine integration tests

### Merge

- exact page count;
- exact source order;
- mixed dimensions preserved;
- output parseable.

### Split/extract

- selected pages and order;
- one-based UI to zero-based engine conversion;
- invalid range rejected before processing.

### Rotate/reorder/delete

- page count and order;
- rotation values;
- all-pages-delete guard.

### Watermark/page numbers

- output opens;
- expected content operator/font embedding behavior where testable;
- selected pages only;
- mixed page dimensions.

### Images/PDF raster

- output dimensions;
- orientation;
- resolution preset;
- memory bounded by batch behavior.

## 5. Golden-file strategy

Binary PDFs may include nondeterministic metadata, so do not rely only on byte equality. Validate semantic properties:

- page count/order;
- media boxes;
- rotation;
- extracted text markers;
- rendered-page pixel comparison with tolerance for visual operations;
- metadata fields;
- valid parse by a second reader where practical.

Store expected artifacts only when licensing permits.

## 6. Component tests

Test:

- keyboard file selection;
- drag-drop feedback;
- option validation;
- cancel/reset;
- progress announcements;
- result and download state;
- errors and recovery;
- reduced-motion behavior;
- ad slot absent when disabled.

## 7. Playwright journeys

Minimum per stable tool:

- happy path;
- invalid input;
- mobile viewport path;
- keyboard-only critical path where relevant.

Platform smoke journeys:

1. homepage -> search -> tool -> process -> download;
2. category -> related tool;
3. theme switch persistence;
4. privacy/legal pages;
5. admin login denial for unauthenticated user;
6. admin setting update with authorized test account;
7. ads globally disabled -> no ad script/containers;
8. ads enabled in mock mode -> approved slots only.

## 8. Network privacy test

For every Local tool, intercept network requests during upload and processing. Fail the test if file bytes, multipart uploads, blob payloads, or extracted content are sent to any endpoint.

Allow only unrelated static assets/config/analytics requests that cannot contain document data. Prefer disabling analytics in this test environment.

## 9. Security testing

### File handling

- verify signature when practical, not extension alone;
- limit recommended size/page count before heavy work;
- handle parser exceptions;
- never execute embedded JavaScript or active content;
- sanitize any rendered metadata/text;
- use object URLs safely and revoke them;
- avoid rendering untrusted text through `dangerouslySetInnerHTML`.

### Browser isolation

- run heavy parsing in workers;
- set a Content Security Policy compatible with required PDF workers and later AdSense;
- prevent clickjacking for admin routes where hosting allows headers;
- use secure headers;
- no secrets in source maps/client bundles.

### Admin

- test RLS directly;
- test role restrictions;
- test session expiry;
- test unauthorized direct database requests;
- audit admin writes;
- redact settings logs.

### Dependencies

- lockfile committed;
- review parser updates;
- verify package provenance/maintenance;
- no unreviewed WASM binary added;
- license inventory maintained.

## 10. Privacy verification

- No file persistence by default.
- No file/content data in analytics.
- No filenames in error monitoring.
- No service worker caching of uploaded blobs.
- No accidental browser history URL containing file data.
- Reset clears references and object URLs.
- Privacy labels match actual implementation.

## 11. Accessibility automation

Use `@axe-core/playwright` on:

- homepage;
- tools index;
- representative tool idle/configuring/processing/success/error states;
- admin login/dashboard;
- legal article page.

No critical or serious violations may remain at release. Manually verify keyboard sorting, screen-reader progress, focus restoration, and color contrast.

## 12. Performance budgets

Set budgets after baseline measurement. Suggested initial goals:

- minimal JavaScript on homepage/category pages;
- PDF engines lazy-loaded only on tool pages;
- tool-specific code split by route;
- avoid loading PDF.js and pdf-lib together when a tool needs only one;
- no large animation library on legal/content pages;
- stable layout around optional ads;
- first meaningful tool controls remain responsive on mid-range mobile.

Track:

- route JS size;
- LCP, CLS, INP;
- time to tool interactive;
- processing time by fixture class;
- peak memory where observable;
- worker startup cost.

## 13. Memory stress tests

Test representative cases, not only tiny PDFs:

- 100+ lightweight pages;
- multiple medium PDFs merged;
- 20 high-resolution images;
- PDF to image at multiple scales;
- repeated process/reset cycles.

Verify no retained object URLs/workers and no continually rising memory pattern.

## 14. Browser matrix

At release:

- Chromium desktop;
- Firefox desktop;
- WebKit/Safari simulation;
- mobile Chrome viewport/device;
- mobile Safari/WebKit viewport/device.

Manual test at least one real mobile device before public launch.

## 15. CI gates

### Pull request

- install with frozen lockfile;
- lint;
- typecheck;
- unit/integration tests;
- build;
- Chromium smoke.

### Release

- all PR checks;
- full browser E2E;
- accessibility suite;
- privacy network suite;
- production build analysis;
- deployment smoke test;
- ads disabled/enabled mock checks;
- admin RLS tests.

## 16. Bug severity

- **P0:** file/content leak, secret exposure, destructive incorrect output, auth bypass.
- **P1:** common tool unusable, corrupted output, download failure, critical accessibility blocker.
- **P2:** limited-browser failure, significant visual/UX issue, inaccurate help text.
- **P3:** cosmetic issue with workaround.

No P0/P1 may ship.

---

**Next read:** `10_DEPLOYMENT_SEO_ADSENSE.md`
