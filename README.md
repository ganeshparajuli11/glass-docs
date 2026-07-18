# GlassDocs AI Build Spec

A reusable multi-file prompt and project-memory system for building a privacy-first PDF toolkit with Next.js, browser-local processing, a glassmorphism UI, a secure admin panel, testing agents, and respectful Google AdSense integration.

Start with [`START_HERE.md`](START_HERE.md).

## How to use

1. Extract this folder into the root of a new Git repository.
2. Give your coding AI the prompt in `START_HERE.md`.
3. Let it execute one task at a time from `.ai/TASK_BOARD.md`.
4. After switching AI tools, use `.ai/HANDOFF.md` rather than explaining the project again.
5. Replace the working codename only after domain/trademark checks.

## Important

This package is a specification, not a finished application. External accounts, approvals, credentials, and legal review remain owner actions.

---

## Quickstart (application)

The application is implemented at this folder's root.

```bash
npm install
npm run dev        # http://localhost:3000
npm run verify     # lint + typecheck + tests + build
npx playwright install chromium && npm run test:e2e   # browser journeys
```

Node 22 LTS recommended. See `VERSIONS_SNAPSHOT.md` and `.ai/HANDOFF.md` for state.
