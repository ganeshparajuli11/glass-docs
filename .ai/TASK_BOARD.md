# Task Board

Status values: Backlog | Ready | In Progress | Review | Done | Blocked

| ID | Task | Owner | Depends on | Status | Acceptance gate |
|---|---|---|---|---|---|
| T-001 | Verify environment and initialize Next.js repository | Orchestrator/Frontend | — | Done | app runs; stable versions recorded; lint/typecheck/build pass |
| T-002 | Install quality tooling and CI baseline | QA | T-001 | Done | unit smoke, Playwright smoke, CI pass |
| T-010 | Create design tokens and theme foundation | Design | T-001 | Done | light/dark/reduced motion; contrast review |
| T-011 | Build responsive public shell | Frontend | T-010 | Done | homepage/header/footer/tool template pass axe/mobile |
| T-012 | Build search and typed tool registry | Frontend | T-011 | Done | registry validation and search tests pass |
| T-020 | Implement PDF contracts, validation, and errors | PDF engine | T-002 | Done | unit tests and architecture boundary pass |
| T-021 | Integrate PDF.js viewer/thumbnail worker | PDF engine | T-020 | Done | fixture renders; invalid/encrypted errors; E2E viewer |
| T-022 | Integrate pdf-lib adapter and output validation | PDF engine | T-020 | Done | sample transformation output parses |
| T-030 | Build shared file drop/workflow/result components | Frontend | T-011,T-020 | Done | keyboard/mobile/progress/reset tests pass |
| T-040 | Build page organizer foundation | Frontend/PDF engine | T-021,T-022,T-030 | Done | reorder/select/keyboard/large-doc behavior pass |
| T-041 | Implement Merge PDF | PDF engine | T-022,T-030 | Done | golden and E2E tests pass |
| T-042 | Implement Split and Extract PDF | PDF engine | T-040 | Done | range/output tests pass |
| T-043 | Implement Rotate, Reorder, Delete pages | PDF engine | T-040 | Done | semantic output tests pass |
| T-044 | Implement Images to PDF | PDF engine | T-030 | Done | orientation/fit/mixed image tests pass |
| T-045 | Implement PDF to images | PDF engine | T-021,T-030 | Done | resolution/batching/download tests pass |
| T-046 | Implement Watermark and Page Numbers | PDF engine | T-022,T-040 | Done | selected-page/mixed-size tests pass |
| T-047 | Implement Metadata, Info, and Extract Text | PDF engine | T-021,T-022 | Done | text/no-text/metadata tests pass |
| T-100 | Create Supabase migrations, auth, and RLS | Connector | T-002 | Backlog | anon/admin RLS tests pass |
| T-101 | Build admin shell and settings | Frontend/Connector | T-100,T-010 | Backlog | unauthorized denied; authorized CRUD works |
| T-102 | Build ad configuration and AdSlot abstraction | Connector/SEO | T-101 | Review | kill switch, route/state exclusions, CLS test |
| T-103 | Add analytics adapter with privacy allowlist | Connector/QA | T-012 | Ready | forbidden properties rejected; consent modes tested |
| T-110 | Add SEO metadata, sitemap, robots, structured data | SEO | T-012 | Done | crawl/index validation pass |
| T-111 | Add useful content and legal/about/contact drafts | SEO | T-110 | Done | no empty/thin pages; links and metadata pass |
| T-112 | Add ads.txt mechanism and AdSense readiness screen | Connector/SEO | T-102,T-111 | Backlog | disabled by default; no invented ID; path verified |
| T-200 | Full accessibility and responsive review | QA/Design | core tools | Ready | no critical/serious axe; manual keyboard checklist |
| T-201 | Full privacy network and security review | QA | core tools,T-100 | Ready | no file exfiltration; no secrets; RLS passes |
| T-202 | Performance and memory optimization | QA/PDF engine | core tools | Ready | budgets and stress fixtures pass |
| T-210 | Configure production deployment candidate | Deployment/Connector | T-200,T-201,T-202 | Backlog | provider terms verified; deploy/smoke/rollback pass |
| T-211 | Domain, Search Console, analytics, and AdSense owner steps | Human + Connector | T-210 | Backlog | external verification evidence recorded |
| T-220 | Final release verification and handoff | Orchestrator/QA | T-210 | Backlog | all MVP release gates pass |

## Current assignment

None — local milestone complete. T-102 is Review (AdSlot done locally; Supabase-driven config pending T-100/101).

## Next Ready task

T-200/T-202 locally, or T-100/T-210 with user credentials.
