# GlassDocs AI Build Specification — Start Here

> Working codename: **GlassDocs**. Replace this before purchasing a domain. Do not assume the name is legally or commercially available.

This folder is the permanent project memory for a privacy-first PDF and document-tools website. It is designed so a new coding AI can continue the project without rereading every source file or repeating completed work.

## Product in one sentence

Build a beautiful, fast, glassmorphism PDF toolkit where common file operations happen locally in the visitor's browser, files are not uploaded by default, the site can begin on free infrastructure, and advertising is added without interrupting the tool workflow.

## Rules for every AI

1. Read this file first.
2. Read `.ai/PROJECT_STATE.md`, `.ai/HANDOFF.md`, `.ai/TASK_BOARD.md`, and `.ai/FILE_MAP.md` before opening application source files.
3. Read only the specification file relevant to the current task.
4. Never claim a feature works until it has tests and a real browser verification.
5. Never silently replace privacy-first client-side processing with file uploads.
6. Never place advertisements beside upload, process, reset, delete, preview controls, or download buttons.
7. Never expose service-role keys, OAuth secrets, database secrets, or private credentials to the browser.
8. Work on one task at a time. Complete its acceptance gate, update project memory, then move to the next ready task.
9. Stop when all scoped tasks are complete. Do not keep redesigning finished work.
10. If blocked, make a bounded best effort, record the blocker, and leave an exact next action.

## Read order for a new project

1. `00_MASTER_BUILD_PROMPT.md`
2. `01_PRODUCT_BRIEF.md`
3. `02_TECH_SETUP.md`
4. `03_ARCHITECTURE_AND_FILE_STRUCTURE.md`
5. `04_UI_UX_AND_AD_PLACEMENT.md`
6. `05_FEATURE_CATALOG_AND_ROADMAP.md`
7. `06_ADMIN_AND_CONNECTORS.md`
8. `07_AGENT_SYSTEM.md`
9. `08_DEVELOPMENT_LOOP_AND_HANDOFF.md`
10. `09_TESTING_SECURITY_PERFORMANCE.md`
11. `10_DEPLOYMENT_SEO_ADSENSE.md`
12. `11_ACCEPTANCE_CRITERIA.md`

After initialization, use the short read path in `.ai/HANDOFF.md` rather than rereading all documents.

## Recommended first execution command to the coding AI

```text
Read START_HERE.md and follow its read order. Initialize the repository, create the persistent .ai project-memory files, and execute only Task T-001 from .ai/TASK_BOARD.md. Do not begin the next task until T-001 meets its acceptance gate. At completion, update .ai/PROJECT_STATE.md, .ai/HANDOFF.md, .ai/FILE_MAP.md, .ai/TEST_REPORT.md, and show the compact completion report defined in 08_DEVELOPMENT_LOOP_AND_HANDOFF.md.
```

## Important hosting decision

- **Development and preview:** Vercel is convenient.
- **Production before revenue:** use a provider whose free plan permits the intended commercial use, such as a compatible Cloudflare Pages/Workers deployment, subject to its current terms and limits.
- **Do not enable AdSense on Vercel Hobby without checking the current plan terms.** At the time this specification was prepared, Vercel Hobby stated that it was for non-commercial personal use.
- The public tool pages should remain portable and capable of static deployment.

## Scope boundary

The first launch is not “every PDF and Office conversion.” It is a reliable set of browser-safe tools. Pixel-perfect DOCX/PPTX/XLSX conversion, OCR, scanned-PDF recognition, advanced compression, repair, and some encryption workflows are later capabilities that may require a backend, WebAssembly, licensed software, or paid compute.

---

**Next read:** `00_MASTER_BUILD_PROMPT.md`
