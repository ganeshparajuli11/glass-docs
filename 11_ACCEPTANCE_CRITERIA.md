# Project Acceptance Criteria

## 1. Milestones

### M0 — Repository and agent foundation

Done when:

- Next.js project initializes with stable compatible dependencies;
- all `.ai`, `.agents`, and skills files exist;
- CI baseline passes;
- version snapshot and dependency policy are recorded;
- base deployment preview works;
- no real integration secrets are required.

### M1 — Design system and public shell

Done when:

- light/dark glass design tokens exist;
- homepage, tools index, tool template, legal/content template, and responsive header/footer exist;
- keyboard navigation and reduced motion work;
- no critical/serious axe violations;
- design remains complete with ads disabled.

### M2 — PDF foundation

Done when:

- typed engine contracts and error taxonomy exist;
- PDF.js worker/rendering works;
- pdf-lib adapter works;
- file lifecycle cleanup is tested;
- invalid/encrypted/malformed files produce safe errors;
- no file bytes leave the browser.

### M3 — Core tool release

Done when all MVP tools marked stable meet their individual gates and the shared workflows are consistent.

### M4 — Admin and integrations

Done when:

- admin authentication works;
- RLS tests pass;
- public config falls back safely;
- ad placement configuration and kill switch work;
- no service-role/private secret appears in client bundles;
- audit logging exists for supported admin changes.

### M5 — SEO, policy, and monetization readiness

Done when:

- metadata, canonicals, sitemap, robots, structured data, and content exist;
- legal/about/contact pages exist and are clearly drafts where appropriate;
- ads are disabled by default;
- mock ad placement review passes;
- ads.txt mechanism exists;
- no thin/planned pages are indexed.

### M6 — Deployment and launch

Done when:

- production hosting is selected under suitable current terms;
- custom domain works;
- full cross-browser and privacy suites pass;
- rollback is tested;
- Search Console/sitemap are configured by the owner;
- final handoff accurately describes production.

## 2. Platform-level acceptance

### Functional

- Search finds tools by name, category, and common synonyms.
- Every listed stable tool opens and works.
- Invalid files never freeze the UI.
- Cancellation and reset are reliable.
- Downloads have correct MIME type and sensible names.
- object URLs/workers are cleaned up.

### Privacy

- Local tools make no document-upload request.
- No document-derived data appears in analytics or errors.
- Privacy badges match reality.
- Remote configuration never changes local processing into an upload silently.

### Accessibility

- Critical workflows keyboard accessible.
- Progress/errors announced.
- Contrast passes.
- Focus behavior is correct.
- Reduced motion works.
- No critical or serious automated violations.

### Performance

- Homepage does not load PDF engines.
- Tool engines lazy-load.
- ad placeholders do not cause severe layout shift.
- representative mobile workflows remain responsive.
- large files have warnings and bounded behavior.

### Security

- strict TypeScript;
- safe parser error handling;
- RLS verified;
- secrets excluded from client;
- dependency/license inventory;
- secure headers/CSP documented and tested.

### Monetization

- ads can be globally disabled instantly;
- no ad near critical controls;
- no auto-refresh;
- no misleading labels/styles;
- tool completion is possible with ads blocked;
- policy review completed before real ads.

## 3. Individual tool acceptance template

```markdown
### Tool: <name>
- Route:
- Processing mode:
- Supported inputs:
- Recommended limits:
- Happy path:
- Edge cases:
- Output properties:
- Privacy network test:
- Unit/integration tests:
- E2E tests:
- Accessibility states:
- Performance fixture:
- Known limitations shown in UI:
- Documentation/FAQ:
- Status: stable only after all required items pass
```

## 4. Release-blocking checklist

Block release for:

- any P0/P1 defect;
- output corruption in a stable tool;
- document data leaving a Local workflow;
- auth/RLS bypass;
- secret exposure;
- inaccessible primary action;
- unsupported browser crash without recovery;
- real ad overlapping controls;
- missing privacy/legal navigation;
- indexing of admin or empty pages;
- hosting terms incompatible with intended use.

## 5. Final completion report

```text
MVP COMPLETE — GlassDocs
Production URL: <url or not yet connected>
Stable tools: <count and names>
Processing: <local/hybrid/server summary>
Tests: <full gate summary>
Accessibility: <summary>
Privacy verification: <summary>
Admin: <summary>
Ads: disabled | mock | approved/live
Hosting: <provider/plan and terms verified date>
Known limitations: <concise list>
Next milestone: <only if intentionally planned>
```

---

**After this file:** read `.ai/PROJECT_STATE.md`, then execute the first Ready task in `.ai/TASK_BOARD.md`.
