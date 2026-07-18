# Technical Setup and Dependency Policy

## 1. Version policy

“Latest” means the latest **stable and mutually compatible** versions at installation time. It does not mean preview, beta, canary, or independent major upgrades that break the framework.

Before installation, run:

```bash
node --version
npm --version
npm view next dist-tags --json
npm view react version
npm view tailwindcss version
npm view typescript version
npm view pdf-lib version
npm view pdfjs-dist version
npm view @supabase/supabase-js version
npm view @playwright/test version
npm view vitest version
```

Then record resolved versions in `VERSIONS_SNAPSHOT.md` and commit the lockfile.

### Verified snapshot when this specification was created

Date: **2026-07-18**

- Node.js LTS: 24.x line; use an exact supported LTS release in `.nvmrc`.
- Next.js latest stable npm tag observed: 16.2.10.
- React: 19.2.7.
- Tailwind CSS: 4.3.3.
- TypeScript registry latest observed: 7.0.2, but use the version selected and supported by the Next.js scaffold unless compatibility is proven.
- pdf-lib: 1.17.1.
- pdfjs-dist: 6.1.200.
- Supabase JS: 2.110.7.
- Playwright: 1.61.1.
- Vitest: 4.1.10.

Treat this as a historical snapshot, not a forever pin.

## 2. Runtime and package manager

Recommended:

- Node.js Active LTS.
- `pnpm` through Corepack for efficient installs and deterministic workspaces.
- Lock the package manager in `package.json`.

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

If the coding environment only supports npm reliably, use npm consistently. Do not mix package managers.

## 3. Initialize the application

```bash
pnpm create next-app@latest glassdocs \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd glassdocs
```

Use stable defaults from the generator. Inspect generated configuration before changing it.

## 4. Core dependencies

Install only when their feature begins, not all at once.

```bash
pnpm add \
  pdf-lib \
  pdfjs-dist \
  react-dropzone \
  zod \
  react-hook-form \
  @hookform/resolvers \
  zustand \
  lucide-react \
  next-themes \
  sonner \
  clsx \
  tailwind-merge
```

Animation:

```bash
pnpm add motion
```

Prefer the current Motion package/API. Add GSAP only for a specific interaction that cannot be implemented cleanly with CSS or Motion. Heavy parallax is not appropriate inside document workflows.

Admin and configuration:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

Testing and quality:

```bash
pnpm add -D \
  vitest \
  @vitest/coverage-v8 \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom \
  @playwright/test \
  axe-core \
  @axe-core/playwright \
  eslint \
  prettier \
  prettier-plugin-tailwindcss
```

Optional bundle analysis:

```bash
pnpm add -D @next/bundle-analyzer
```

## 5. UI component setup

Use shadcn/ui as source components, not as the visual identity.

```bash
pnpm dlx shadcn@latest init
```

Add only necessary components, for example:

```bash
pnpm dlx shadcn@latest add button dialog dropdown-menu input label progress sheet tabs tooltip alert checkbox switch table
```

Refactor generated components to use design tokens and accessibility requirements.

## 6. Recommended scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "verify": "pnpm lint && pnpm typecheck && pnpm test && pnpm build",
    "versions:check": "node scripts/check-package-versions.mjs"
  }
}
```

## 7. TypeScript rules

- `strict: true`.
- Avoid `any`; use `unknown` and validation.
- Every PDF tool has typed input, options, progress events, result, and error codes.
- Validate route/config data using Zod.
- No non-null assertions around uploaded files or parsed PDFs without a verified guard.

## 8. Environment variables

Create `.env.example` with placeholders only:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=GlassDocs
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_BOOTSTRAP_EMAIL=
```

Rules:

- Publisher IDs and measurement IDs may be public by design, but still validate them.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must not exist in client modules.
- Static deployment should avoid requiring service-role operations at runtime.
- Never commit `.env.local`.

## 9. Static-first deployment configuration

Public tool routes must avoid mandatory server functions. Keep a deployment mode switch:

- `DEPLOY_TARGET=static` for Cloudflare Pages/static hosting.
- `DEPLOY_TARGET=server` for a full Next runtime later.

A static build may use `output: "export"` when all enabled features support it. Do not turn it on until routes and image settings have been validated.

Admin pages can be client-rendered and communicate directly with Supabase using the anon key plus strict RLS. Sensitive administrative bootstrap or role-grant operations must be performed through a secure one-time setup, not through a public client function.

## 10. PDF engine policy

Use adapters:

- `PdfLibAdapter` for supported create/modify operations.
- `PdfJsAdapter` for rendering, page previews, document info, and text extraction.
- `WorkerBridge` for background processing.

Do not assume pdf-lib supports encryption, OCR, repair, or true content optimization. Any additional WASM package must pass:

1. license review;
2. maintenance/reputation review;
3. malware/dependency audit;
4. browser compatibility test;
5. bundle-size test;
6. memory test;
7. golden-file correctness tests.

## 11. Worker setup

Create dedicated workers under `src/workers/`. Messages must be serializable, typed, cancellable, and include task IDs. Transfer `ArrayBuffer` objects where possible instead of copying them.

Workers must report:

- queued;
- parsing;
- processing with percent when measurable;
- serializing;
- complete;
- cancelled;
- failed with error code.

## 12. Git and CI

Initialize Git immediately. Recommended branches:

- `main` — deployable.
- short-lived feature branches if multiple humans/agents work concurrently.

CI checks on pull request:

```text
install -> lint -> typecheck -> unit tests -> build -> selected E2E smoke tests
```

Full cross-browser E2E can run nightly or before release to manage free CI usage.

## 13. Dependency-security rules

- Run `pnpm audit` as a signal, not as the only security check.
- Do not automatically apply breaking force fixes.
- Review packages with install scripts.
- Avoid abandoned packages for critical file parsing.
- Add a Content Security Policy plan before enabling third-party ads and analytics.
- Keep PDF libraries patched because parsers handle untrusted input.

## 14. Browser support

Target current stable versions of Chrome, Edge, Firefox, and Safari, plus recent mobile Safari and Chrome. Display an honest unsupported-browser message when required APIs are missing.

---

**Next read:** `03_ARCHITECTURE_AND_FILE_STRUCTURE.md`
