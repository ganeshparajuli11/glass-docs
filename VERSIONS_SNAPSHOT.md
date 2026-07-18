# Versions Snapshot

Resolved and locked on 2026-07-18 (T-001). Environment: Node.js v22 LTS, npm 10.9.8.

| Package | Version |
|---|---|
| next | 16.2.10 |
| react / react-dom | 19.2.4 |
| typescript | 5.9.3 |
| tailwindcss | 4.3.3 |
| pdf-lib | 1.17.1 |
| pdfjs-dist | 6.1.200 |
| zod | 4.4.3 |
| next-themes | ^0.4 |
| vitest | 4.1.10 |
| @playwright/test | 1.61.1 |

Notes:
- Matches the verified snapshot in `02_TECH_SETUP.md` (Next 16.2.10, pdf-lib 1.17.1, pdfjs-dist 6.1.200, Playwright 1.61.1, Vitest 4.1.10).
- npm (not pnpm) is used; the environment did not provide Corepack/pnpm. Locked in `package-lock.json`.
- The pdf.js worker is copied to `public/pdf.worker.min.mjs` by `scripts/copy-pdf-worker.mjs` (wired into dev/build scripts).
