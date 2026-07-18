# Architecture and File Structure

## 1. Architecture principles

1. **Local first:** file bytes stay in browser memory for local tools.
2. **Feature isolation:** each tool is a small vertical slice with metadata, UI, engine call, tests, and help content.
3. **Engine abstraction:** UI never directly mixes low-level PDF library calls with React state.
4. **Static first:** public pages can deploy without server compute.
5. **Progressive enhancement:** previews and animations can fail gracefully while the core operation remains usable.
6. **Deterministic output:** the same input/options should produce equivalent output unless metadata timestamps are intentionally set.
7. **Bounded memory:** process page thumbnails and raster exports in batches.
8. **Recoverable workflow:** cancellation and reset are first-class.

## 2. Logical layers

```text
Presentation
  pages, layouts, components, design tokens

Application
  tool registry, workflows, validation, progress, state machines

Domain
  page selections, ranges, transformations, output contracts, error taxonomy

Infrastructure
  pdf-lib adapter, PDF.js adapter, workers, download, Supabase config, ads, analytics

Quality
  fixtures, golden files, unit tests, E2E, accessibility, performance
```

## 3. Proposed repository tree

```text
glassdocs/
├─ .agents/
│  ├─ orchestrator-agent.md
│  ├─ design-agent.md
│  ├─ frontend-agent.md
│  ├─ pdf-engine-agent.md
│  ├─ admin-connector-agent.md
│  ├─ qa-agent.md
│  └─ seo-monetization-agent.md
├─ .ai/
│  ├─ PROJECT_STATE.md
│  ├─ TASK_BOARD.md
│  ├─ FILE_MAP.md
│  ├─ DECISIONS.md
│  ├─ HANDOFF.md
│  ├─ TEST_REPORT.md
│  └─ CHANGELOG.md
├─ public/
│  ├─ brand/
│  ├─ icons/
│  ├─ samples/
│  ├─ robots.txt               # generated or static depending deployment
│  └─ ads.txt                  # generated/template after approval
├─ scripts/
│  ├─ check-package-versions.mjs
│  ├─ generate-tool-pages.mjs  # only if needed; avoid thin content
│  ├─ validate-tool-registry.mjs
│  └─ verify-no-secret-client-imports.mjs
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx
│  │  │  ├─ tools/page.tsx
│  │  │  ├─ tools/[slug]/page.tsx
│  │  │  ├─ pdf/page.tsx
│  │  │  ├─ learn/page.tsx
│  │  │  ├─ learn/[slug]/page.tsx
│  │  │  ├─ about/page.tsx
│  │  │  ├─ contact/page.tsx
│  │  │  ├─ privacy/page.tsx
│  │  │  ├─ terms/page.tsx
│  │  │  └─ cookies/page.tsx
│  │  ├─ admin/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ ads/page.tsx
│  │  │  ├─ integrations/page.tsx
│  │  │  ├─ seo/page.tsx
│  │  │  ├─ site/page.tsx
│  │  │  └─ tools/page.tsx
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ shell/
│  │  ├─ tool/
│  │  ├─ pdf-preview/
│  │  ├─ ads/
│  │  ├─ admin/
│  │  ├─ seo/
│  │  └─ feedback/
│  ├─ config/
│  │  ├─ site.ts
│  │  ├─ navigation.ts
│  │  ├─ limits.ts
│  │  └─ features.ts
│  ├─ content/
│  │  ├─ tools/
│  │  ├─ articles/
│  │  └─ legal/
│  ├─ features/
│  │  ├─ merge-pdf/
│  │  ├─ split-pdf/
│  │  ├─ rotate-pdf/
│  │  ├─ reorder-pages/
│  │  ├─ delete-pages/
│  │  ├─ extract-pages/
│  │  ├─ watermark-pdf/
│  │  ├─ page-numbers/
│  │  ├─ images-to-pdf/
│  │  ├─ pdf-to-images/
│  │  ├─ pdf-viewer/
│  │  ├─ metadata/
│  │  └─ extract-text/
│  ├─ lib/
│  │  ├─ pdf/
│  │  │  ├─ contracts.ts
│  │  │  ├─ errors.ts
│  │  │  ├─ ranges.ts
│  │  │  ├─ adapters/
│  │  │  ├─ operations/
│  │  │  └─ validation/
│  │  ├─ files/
│  │  ├─ ads/
│  │  ├─ analytics/
│  │  ├─ auth/
│  │  ├─ supabase/
│  │  ├─ seo/
│  │  └─ utils/
│  ├─ stores/
│  ├─ workers/
│  │  ├─ pdf.worker.ts
│  │  ├─ image.worker.ts
│  │  └─ bridge.ts
│  └─ types/
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ README.md
├─ tests/
│  ├─ fixtures/
│  │  ├─ pdf/
│  │  ├─ images/
│  │  └─ malicious-or-invalid/
│  ├─ golden/
│  ├─ unit/
│  ├─ integration/
│  ├─ e2e/
│  ├─ accessibility/
│  └─ performance/
├─ AGENTS.md
├─ START_HERE.md
├─ VERSIONS_SNAPSHOT.md
├─ .env.example
├─ package.json
├─ pnpm-lock.yaml
└─ README.md
```

## 4. Tool registry

Create one typed registry as the source of truth. Example shape:

```ts
export type ProcessingMode = "local" | "hybrid" | "server";
export type ToolStatus = "stable" | "beta" | "experimental" | "planned";

export interface ToolDefinition {
  slug: string;
  name: string;
  shortDescription: string;
  category: "pdf" | "image" | "document";
  processingMode: ProcessingMode;
  status: ToolStatus;
  engine: "pdf-lib" | "pdfjs" | "browser-canvas" | "combined" | "future";
  acceptedMimeTypes: string[];
  outputMimeTypes: string[];
  maxRecommendedSizeMb: number;
  supportsMultipleFiles: boolean;
  keywords: string[];
  relatedTools: string[];
  component: React.ComponentType;
  lastVerifiedAt: string;
}
```

Registry validation must fail the build for duplicate slugs, missing related tools, invalid status/route combinations, or stable tools without tests.

## 5. Workflow state machine

Avoid loose booleans such as `isLoading`, `hasError`, and `isDone` that can conflict. Use a state machine or discriminated union:

```ts
type ToolState =
  | { status: "idle" }
  | { status: "files-ready"; files: InputFile[] }
  | { status: "configuring"; files: InputFile[] }
  | { status: "processing"; progress: ProgressState }
  | { status: "success"; result: ToolResult }
  | { status: "error"; error: ToolError }
  | { status: "cancelled" };
```

## 6. File lifecycle

1. Validate MIME type and signature where possible.
2. Read into memory only when needed.
3. Parse in a worker for heavy operations.
4. Produce output bytes.
5. Create object URL.
6. Allow preview/download.
7. Revoke object URL on reset, replacement, or unmount.
8. Clear references so garbage collection can release memory.

Do not log file names unless the user explicitly opts into a debug report; even then redact by default.

## 7. Error taxonomy

Use stable user-safe error codes:

- `FILE_TYPE_UNSUPPORTED`
- `FILE_TOO_LARGE_RECOMMENDED`
- `FILE_EMPTY`
- `PDF_INVALID`
- `PDF_ENCRYPTED_UNSUPPORTED`
- `PDF_PARSE_FAILED`
- `PAGE_RANGE_INVALID`
- `MEMORY_LIMIT_REACHED`
- `OPERATION_CANCELLED`
- `OUTPUT_FAILED`
- `BROWSER_UNSUPPORTED`
- `UNKNOWN_PROCESSING_ERROR`

Errors have:

- safe public message;
- optional recovery action;
- technical detail stored only in local development logs;
- no document content.

## 8. Processing boundaries

### Keep on main thread

- form state;
- small metadata reads if proven fast;
- UI updates;
- simple validation.

### Move to worker

- parsing large PDFs;
- rendering multiple thumbnails;
- raster exports;
- multi-file merge;
- image resizing;
- page-level transformations on large documents.

## 9. Supabase boundary

Supabase stores only site configuration and admin data, never public user documents in MVP.

Suggested tables:

- `site_settings`
- `ad_placements`
- `integration_settings_public`
- `tool_overrides`
- `seo_overrides`
- `admin_profiles`
- `admin_audit_log`

Private secrets should remain in deployment secrets or Supabase Vault/server-side functions if later introduced. Do not put API secrets in database rows readable by the anon client.

## 10. Analytics boundary

Allowed events:

- tool page viewed;
- file selected count and coarse size bucket;
- operation started;
- operation succeeded/failed by safe error code;
- duration bucket;
- download clicked;
- related tool clicked.

Forbidden data:

- file name;
- file bytes;
- text content;
- metadata values;
- password;
- exact page contents;
- user-entered watermark text;
- extracted text.

## 11. Import boundaries

Enforce with lint or architecture tests:

- components may import application/domain contracts, not low-level PDF packages directly;
- `src/lib/pdf/adapters` may import PDF packages;
- workers may import adapters/operations;
- public pages may not import server secrets;
- ad components may not import tool state internals except safe completion signals.

---

**Next read:** `04_UI_UX_AND_AD_PLACEMENT.md`
