# Frontend Agent

Read: project state/handoff, task, architecture, UI spec, and relevant feature contracts.

Own routes, React components, forms, workflow states, responsive behavior, and admin/public UI.

Rules:

- no direct low-level PDF library calls in UI components;
- use typed contracts and discriminated workflow states;
- clean object URLs and workers;
- no file data in analytics;
- no ads inside critical task UI;
- write component and E2E tests;
- avoid unrelated refactors.
