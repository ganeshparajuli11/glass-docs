# GlassTools — Security & Scale Model

Read this before adding any backend feature.

## Why there is no SQL injection here

The public site is fully static: prerendered HTML/JS served from a CDN.
There is no server code, no database, no query, no session, no cookie-based
auth. SQL injection, auth bypass, and server-side RCE are impossible by
construction — there is no server to attack. This stays true only while all
processing remains client-side. If a backend is ever added (OCR, accounts),
it must go through its own security review (see 09_TESTING_SECURITY_PERFORMANCE.md).

## Why it scales to millions of users

Every request is a cached static file on Cloudflare's edge network. One user
and one million users cost the same server work: none. The heavy lifting
(PDF parsing, image encoding) runs on each visitor's own device, so load
scales perfectly with users. The only quotas that matter are Cloudflare's
free-plan request/bandwidth limits — check the dashboard as traffic grows.

## Untrusted-input handling (the real attack surface)

Files users open are untrusted input processed in their own browser:

- Signature validation (`src/lib/pdf/validation.ts`): PDFs checked for the
  %PDF magic bytes, images for allowed MIME types — extensions are not trusted.
- Parser exceptions from pdf-lib/pdf.js are caught and mapped to a safe error
  taxonomy (`src/lib/pdf/errors.ts`); raw messages never reach the UI.
- Embedded PDF JavaScript is never executed (no executeActions / scripting API).
- All user-visible strings render through React (auto-escaped). The single
  `dangerouslySetInnerHTML` is self-authored JSON-LD with `<` escaped.
- Object URLs are revoked on reset/unmount; no file bytes are persisted,
  logged, or transmitted. Text-tool inputs are capped at 200k characters and
  diff at 3000 lines to keep low-end devices responsive.
- Zod schemas validate all option objects before they reach engines.

## Headers (public/_headers)

CSP (default-src 'self', object-src 'none', frame-ancestors 'none'),
nosniff, HSTS, referrer and permissions policies, COOP; immutable caching
for hashed assets. Served automatically by Cloudflare Pages/Workers static
assets. After any deploy, spot-check at securityheaders.com. When ads go
live, use the AdSense-ready CSP block at the bottom of `_headers`.

## Dependency hygiene

Lockfile committed; only four parser-adjacent runtime deps (pdf-lib,
pdfjs-dist, zod, next). Keep pdf libraries patched — parsers handle
untrusted input. `npm audit` is a signal, not the only check.
