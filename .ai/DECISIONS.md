# Architecture Decisions

## ADR-001 — Privacy-first local processing
Date: 2026-07-18
Status: Accepted
Decision: Common MVP PDF operations execute in the browser and do not upload files.
Reason: zero/low hosting cost, privacy differentiation, speed, and lower liability.
Consequence: some advanced features are deferred.

## ADR-002 — Static-first public application
Date: 2026-07-18
Status: Accepted
Decision: Public routes cannot require a proprietary server runtime.
Reason: portability and free commercial-friendly hosting options.
Consequence: dynamic admin/config uses Supabase client plus RLS; server-only features come later.

## ADR-003 — Vercel Hobby is preview-first
Date: 2026-07-18
Status: Accepted
Decision: Do not assume Vercel Hobby is the monetized production host.
Reason: current documentation described Hobby as non-commercial personal use.
Consequence: verify Cloudflare/other provider terms for production or pay for suitable hosting.

## ADR-004 — Ads never enter the tool workflow
Date: 2026-07-18
Status: Accepted
Decision: no ads inside or adjacent to upload, processing, preview, or download controls.
Reason: user trust, usability, accidental-click prevention, policy safety.

## ADR-005 — Office conversion/OCR deferred
Date: 2026-07-18
Status: Accepted
Decision: no pixel-perfect Office conversions or OCR in MVP.
Reason: browser-only implementations cannot reliably promise fidelity; compute/licensing cost.

## ADR-006 — Repository is the AI memory
Date: 2026-07-18
Status: Accepted
Decision: `.ai` state files are updated after every task.
Reason: AI switching and token efficiency.

## ADR-001 — npm instead of pnpm
Date: 2026-07-18 · Status: Accepted
Decision: Use npm; environment lacks Corepack/pnpm.
Consequences: `package-lock.json` is the lockfile; do not mix managers.

## ADR-002 — pdf-lib operations on main thread for v1
Date: 2026-07-18 · Status: Accepted
Decision: No custom Web Worker for pdf-lib ops yet; pdf.js already uses its own worker for rendering/text.
Reason: bounded scope; recommended-size files process fast; ops are pure and worker-ready.
Consequences: revisit with a WorkerBridge if large-file jank appears (contracts already serializable).

## ADR-003 — WebP/EXIF normalized via canvas before embedding
Date: 2026-07-18 · Status: Accepted
Decision: images-to-pdf decodes via createImageBitmap({imageOrientation:'from-image'}) and re-encodes (WebP→PNG, JPEG re-encoded) client-side; the pure operation accepts only jpg/png bytes.
Consequences: EXIF rotation correct; slight re-encode cost; operation remains node-testable.

## ADR-004 — Metadata viewer/editor and PDF info combined into one tool
Date: 2026-07-18 · Status: Accepted
Reason: same input, same audience; avoids a thin page.

## ADR-005 — Multi-file outputs download individually (no ZIP)
Date: 2026-07-18 · Status: Accepted
Reason: spec requires a reviewed ZIP dependency before bundling; deferred.

## ADR-006 — System font stack instead of Google-hosted font
Date: 2026-07-18 · Status: Accepted
Reason: build-time font download unavailable in sandbox; also removes a third-party request. Revisit with a self-hosted variable font later.

## ADR-007 — No motion/react-dropzone/zustand/sonner/shadcn deps in v1
Date: 2026-07-18 · Status: Accepted
Reason: CSS transitions + native drop zone + component state cover MVP; fewer parser/lock risks. Add `motion` only for a specific interaction that CSS cannot do.
