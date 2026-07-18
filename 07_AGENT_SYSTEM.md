# Multi-Agent System

## 1. Goal

Use specialized agents without losing continuity or allowing conflicting edits. The repository, not chat history, is the memory.

## 2. Agent roles

### Orchestrator

- owns task ordering and scope;
- assigns one primary agent per task;
- prevents concurrent edits to the same files;
- runs completion gates;
- updates project memory;
- decides Done, Partial, or Blocked;
- stops the loop when scope is complete.

### Design agent

- owns design tokens, layout, responsive states, accessibility interaction design, and visual review;
- may not change PDF processing algorithms without handoff.

### Frontend agent

- owns React components, workflows, state, routes, forms, and public/admin UI implementation;
- must use engine contracts rather than direct PDF calls.

### PDF engine agent

- owns parsing/transformation adapters, workers, output validation, golden files, performance/memory behavior;
- does not redesign pages.

### Admin/connector agent

- owns Supabase schema/RLS/auth, safe public configuration, AdSense/analytics adapters, deployment integration files;
- cannot expose secrets or weaken RLS for convenience.

### QA agent

- owns test strategy, fixtures, E2E, accessibility, performance, regression checks, and adversarial inputs;
- reports evidence, not opinions.

### SEO/monetization agent

- owns metadata, structured data, content quality checks, sitemap/robots, policy pages, ad placement review, and indexing controls;
- cannot add intrusive placements or thin pages.

## 3. Shared operating contract

Every agent must:

1. read the short project-memory path;
2. announce/record the task ID it owns;
3. list files it expects to touch;
4. avoid unrelated refactors;
5. write tests with the implementation;
6. update relevant documentation;
7. leave the repository buildable;
8. write a handoff note if another role is required;
9. avoid opening large unrelated files;
10. never overwrite another agent’s active work.

## 4. File ownership map

| Area | Primary owner | Required reviewer |
|---|---|---|
| `src/components/ui`, tokens | Design | Frontend/QA |
| `src/app`, `src/features` UI | Frontend | Design/QA |
| `src/lib/pdf`, `src/workers` | PDF engine | QA |
| `supabase`, auth, integration config | Connector | QA/security review |
| `tests` | QA | owning implementation agent |
| SEO/content/ad layout | SEO/monetization | Design/QA |
| `.ai` state | Orchestrator | none; factual only |

## 5. Agent assignment format

```markdown
## Assignment
- Task: T-XXX — title
- Primary agent: role
- Reviewer: role
- Allowed files: paths/globs
- Required inputs: state/spec files
- Acceptance gate: exact commands and user journey
- Out of scope: explicit exclusions
- Handoff target: next role or orchestrator
```

## 6. Parallel-work rule

Parallel work is allowed only when:

- file ownership does not overlap;
- interfaces are already agreed and committed;
- each agent has a separate branch/worktree;
- the orchestrator defines merge order;
- CI runs after integration.

Otherwise work sequentially.

## 7. Review rule

A reviewer checks:

- acceptance criteria;
- regressions;
- privacy boundary;
- accessibility;
- unsupported claims;
- architecture boundary;
- test quality;
- docs/state accuracy.

Reviewers should not rewrite the entire feature unless the task is formally reassigned.

## 8. Stop conditions

The agent loop stops when:

- all tasks within the requested milestone are Done;
- final acceptance gates pass;
- state and handoff files are updated;
- no unreviewed critical TODO remains.

It also stops with Blocked when:

- user-owned credentials/approval are required;
- a legal/license decision is required;
- a provider is unavailable;
- the same acceptance gate fails after three focused repair cycles;
- completing the task would violate a non-negotiable constraint.

## 9. Anti-loop safeguards

- Maximum three repair cycles per failing gate.
- No cosmetic redesign after design acceptance unless a regression is demonstrated.
- No dependency upgrade during a feature task unless required to fix a verified issue.
- No “while here” refactoring.
- Every new task must have an ID and acceptance gate.
- When no Ready task exists, stop and report blockers.

## 10. Context-minimizing read strategy

### New AI/session

Read:

1. `START_HERE.md`
2. `.ai/PROJECT_STATE.md`
3. `.ai/HANDOFF.md`
4. `.ai/TASK_BOARD.md`
5. `.ai/FILE_MAP.md`
6. current task spec/agent prompt
7. only relevant source files

### Existing AI after one task

Read only the updated project-memory files and next task definition.

## 11. Agent prompt files

Role prompts are stored under `.agents/`. They are concise on purpose and reference this specification. They should travel with the repository when switching AI tools.

## 12. Skills

The `skills/` folder contains reusable capability instructions. A coding environment that supports custom skills can copy or link them into its recognized skill directory. Otherwise, agents read the relevant `SKILL.md` manually.

Required skills:

- UI design and accessibility;
- PDF engine and browser workers;
- testing and adversarial fixtures;
- SEO and AdSense-safe placement;
- Supabase admin and RLS;
- deployment and rollback.

## 13. Human approval checkpoints

Even in autonomous mode, stop before:

- purchasing or selecting final domain/brand;
- enabling real ads;
- connecting real analytics in jurisdictions needing consent decisions;
- granting first admin role;
- creating a paid service;
- uploading files to any server;
- accepting a restrictive PDF-engine license;
- publishing legal text as professional legal advice.

---

**Next read:** `08_DEVELOPMENT_LOOP_AND_HANDOFF.md`
