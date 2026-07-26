# P0 audit implementation — handoff

**Source:** `GLASSTOOLS_SEO_DEVELOPER_AUDIT.md` (2026-07-26)
**Scope agreed:** P0 findings plus the code half of the 48-hour checklist
**Date:** 2026-07-26

---

## 1. What changed in the code

### PRIV-001 — AdSense no longer loads merely because a publisher ID exists

`src/config/ads.ts` now tracks three independent states instead of one boolean:

| State | Meaning | Effect |
|---|---|---|
| `clientId` | a syntactically valid publisher ID exists | nothing on its own |
| `verifying` | Google is still reviewing the site | loader script only, no ad units |
| `enabled` | we are actually monetising | loader script **and** ad units |

`adConfig.loadScript` is the single thing the layout checks. `consentRequiredBeforeAds`
is set and documented so that switching ads on without a consent mechanism is a
visible decision rather than an accident.

Defaults today: `enabled: false`, `verifying: true`, `loadScript: true` — so your
in-flight AdSense verification keeps working, and no advertisement renders anywhere.

**Deliberate deviation from the audit.** The audit suggests `next/script` with
`strategy="afterInteractive"`. That would have broken verification: `next/script`
injects the tag after hydration, so it is absent from the static HTML that
Google's verification crawler reads. The plain `<script>` is kept — React hoists
it into `<head>` at prerender time — with a comment explaining why. This was
verified against the live site before changing anything.

### TRUST-001 — contact page

`src/app/contact/page.tsx` publishes `hello@glasstools.net` with sections for bug
reports, accessibility, privacy and security, plus a prominent warning not to
email documents or passwords. Placeholder copy is gone.

### TRUST-002 — privacy, terms, cookies

All three "Draft — to be reviewed before public launch" banners are replaced with
an effective date, the operator's name and a contact address.

The important structural change: the advertising and third-party-script wording
on `/privacy` and `/cookies` is **generated** by `describeAdState()` in
`src/config/ads.ts`. Policy text is now derived from the same configuration that
controls runtime behaviour, so the two cannot silently disagree. The old claim
that no third-party script was loaded — untrue while the AdSense loader is
present — is gone.

`/cookies` also now names the actual storage used (`theme` in `localStorage`, via
next-themes) and acknowledges normal Cloudflare request handling.

### META-001 — homepage title

**The reported duplication does not occur.** Next.js applies `title.template` only
to *child* segments, and `app/page.tsx` is the same segment as `app/layout.tsx`.
I confirmed this against the live HTML before editing:

- homepage: `GlassTools — Free private PDF, image & student tools in your browser`
- merge-pdf: `Merge PDF — free & private, in your browser — GlassTools`

Brand appears once on both. What was worth fixing is title *quality*: the old
homepage title was 66 characters and led with the brand. It is now
`Free Private PDF & Image Tools in Your Browser — GlassTools` (59 characters,
task first, brand once). A comment in `page.tsx` records why the brand must be
written explicitly there.

### TRUST-003 (partial) — accountable ownership

- `src/config/site.ts` gains `operator`, `contact`, `alternateName` and `effectiveDate`.
- `/about` names you as the sole operator, links the repository, describes the
  local-processing architecture, and lists how the tools are actually tested.
- Homepage `WebSite`/`Organization` JSON-LD gains `alternateName`, a
  disambiguating description and `founder` — a cheap partial answer to BRAND-001,
  where "GlassTools" currently reads as glazing equipment.

The About page states plainly that a per-browser compatibility matrix is
outstanding rather than implying one exists.

### SCHEMA-002 (opportunistic) — centralised absolute URLs

New `src/lib/seo/url.ts` exports `absoluteUrl()`. The hardcoded
`https://glasstools.net` strings in `tools/[slug]`, `learn/[slug]`,
`CategoryLanding` and `sitemap.ts` now resolve through `site.url`.

This was not in the agreed scope — the new regression test caught it, and the fix
was three lines per site, so it went in. Article JSON-LD also gained a real
`author` (a Person, not a fictional organisation) and a `publisher` block.

### SITEMAP-001 (partial)

Tool entries now carry `lastModified` from each tool's real `lastVerifiedAt`
date. Guides and static pages deliberately have none, because there is no
truthful per-page date to use yet — better absent than fabricated.

### TEST-001 — SEO regression tests

`tests/seo/` adds 53 assertions across three files, wired into `npm test`:

- **`metadata.test.ts`** — scans every `page.tsx`/`layout.tsx` for draft and
  placeholder language, requires effective dates and contact routes on trust
  pages, enforces brand-once and sensible title length, forbids hardcoded
  origins. Code comments are stripped before scanning, since a developer `TODO`
  is not public copy.
- **`registry.test.ts`** — sitemap covers every tool, guide and category exactly
  once; no duplicates, query strings or doubled slashes; every related-tool and
  guide slug resolves; no orphans; titles and descriptions are unique.
- **`ads.test.ts`** — the three ad states behave correctly, the layout gates on
  `loadScript` and not on `clientId`, the loader appears exactly once and is not
  `next/script`, and the cookies page renders the generated state description.

Each test was mutation-checked: reverting the AdSense gate, reinstating
placeholder copy, and hardcoding an origin each produce exactly one failure.

---

## 2. Verification status

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint` | clean |
| SEO suite (53 assertions) | 53 pass, mutation-checked |
| `npm test` (existing unit + integration) | **not run** — see below |
| `npm run build:static` | **not run** — see below |

The build and the existing vitest suites could not run in my sandbox: the
installed `node_modules` contains Windows-only native binaries
(`@next/swc-win32-x64-msvc`, `@rolldown/binding-win32-*`) and the sandbox has no
npm registry access to fetch Linux equivalents. The SEO tests were executed
through a TypeScript-based harness instead, so they are known-good rather than
merely written.

**Please run `npm run verify` on Windows before deploying.** CI will also run it
on push.

---

## 3. Your actions — these cannot be done from code

### a. Make `hello@glasstools.net` actually work — do this first

The contact, privacy and terms pages now publish this address. Until routing
exists, it bounces, which is worse than the placeholder it replaced.

1. Cloudflare dashboard → glasstools.net → **Email** → Email Routing → enable.
2. Add the MX and TXT records Cloudflare offers (one click if it runs your DNS).
3. Create a custom address: `hello@glasstools.net` → forward to
   `ganeshparajuli2059@gmail.com`.
4. Confirm the verification email Cloudflare sends to that Gmail address.
5. Send a test message from an unrelated account and confirm it arrives.

### b. Deploy

```
npm run verify          # lint, typecheck, test, build
git add -A && git commit -m "P0: trust pages, AdSense state separation, SEO tests"
git push
```

Cloudflare Pages builds from git, so pushing is the deploy.

### c. Confirm the AdSense script survived

After deploying, view source on `https://glasstools.net/` and confirm the
`pagead2.googlesyndication.com` tag is still in `<head>`. It should be —
`verifying` defaults to true — but the gate is new, so verify rather than assume.
Then tick "I've placed the code" in AdSense.

### d. Google Search Console (SEO-001)

Not started. Add a **Domain** property for `glasstools.net`, verify by DNS TXT,
submit `https://glasstools.net/sitemap.xml`, then inspect `/`,
`/tools/merge-pdf`, `/tools/split-pdf`, `/tools/images-to-pdf`,
`/tools/image-compressor` and `/learn/merge-pdfs-without-uploading`. Record
Google's selected canonical for each. Request indexing once, after this deploy —
not repeatedly.

### e. Canonical host redirects (TECH-001)

Test `http://glasstools.net`, `http://www.glasstools.net`,
`https://www.glasstools.net` and confirm each performs exactly one 301 to
`https://glasstools.net`. This is a Cloudflare dashboard setting and cannot be
checked from the repository.

### f. Mobile Lighthouse baseline (PERF-001)

Record before-numbers for the homepage, merge-pdf and a guide now, so the
blur/animation work later has something to compare against.

---

## 4. Two things to correct if I got them wrong

- **Name spelling.** You wrote "Ganesh Patajuli"; I used **Ganesh Parajuli**, matching
  your GitHub handle `ganeshparajuli11`. If the first spelling was right, change
  `site.operator.name` in `src/config/site.ts` — it is the only place it lives.
- **Repository visibility.** `/about`, `/contact` and `/terms` link to
  `github.com/ganeshparajuli11/glass-docs` and the terms page refers to its
  licence. If the repo is private, either make it public or remove
  `site.operator.repository` and those links.

---

## 5. Not done — remaining audit work

Nothing below was touched. Roughly the audit's own priority order:

**P1 content and architecture**

- CONTENT-001/002 — the typed per-tool SEO content model and enriched top-ten
  tool pages. This is the largest remaining item and the one most likely to
  affect rankings.
- IA-001 — `/tools` renders its whole inventory from a client component. Tool
  pages have the same shape: fetching `/tools/merge-pdf` returns
  "Loading tool…" where the workspace should be.
- IA-002 — category hubs still absent from header and footer.
- SOCIAL-001 — no Open Graph images anywhere.
- SCHEMA-001 — article dates are still a single hardcoded value (currently
  truthful: every guide was written 2026-07-18, confirmed from git history).
- TOPIC-001 — EMI calculator still in navigation and sitemap.
- PERF-001 — no measurements taken.

**P2** — CONTENT-003 (guide evidence and screenshots), TECH-001 headers,
MEDIA-001 image plan.

**Consent gate** — required before `NEXT_PUBLIC_ADSENSE_ENABLED=true`. The flag
`consentRequiredBeforeAds` marks the obligation; it does not satisfy it.
