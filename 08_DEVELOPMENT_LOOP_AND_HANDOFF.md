# Development Loop, Token-Saving State, and Handoff

## 1. Persistent project memory

The `.ai/` directory is updated after every completed task.

### `PROJECT_STATE.md`

Current milestone, architecture, working capabilities, known issues, deployment status, and overall completion.

### `TASK_BOARD.md`

Task IDs, status, dependencies, owner role, and acceptance gates.

### `FILE_MAP.md`

A compact map of important files and their purpose. This prevents future agents from scanning the whole repository.

### `DECISIONS.md`

Architecture Decision Records in short form: decision, reason, alternatives, consequences, date.

### `HANDOFF.md`

The single most important session-transfer file: last completed task, changed files, tests, next ready task, blockers, and exact read list.

### `TEST_REPORT.md`

Latest command outcomes and known untested areas.

### `CHANGELOG.md`

User-visible changes by task ID.

## 2. Task lifecycle

```text
Backlog -> Ready -> In Progress -> Review -> Done
                         |            |
                         -> Blocked <-
```

Only the orchestrator changes task status to Done.

## 3. Bounded execution loop

```text
while milestone has Ready tasks:
    select highest-priority unblocked task
    assign primary agent
    read only required context
    implement smallest complete change
    run targeted checks
    repair failures, maximum 3 cycles
    run acceptance gate
    obtain required review
    update .ai state files
    emit compact completion report
stop when milestone complete or blocked
```

## 4. Completion report shown after every task

```text
TASK COMPLETE: T-XXX — <title>
Status: Done
Changed: src/..., tests/..., docs/...
Verified: lint ✓ | typecheck ✓ | targeted unit 12/12 ✓ | Playwright scenario ✓
Last completed capability: <one factual sentence>
Next ready task: T-YYY — <title>
Compact tree:
├─ src/...
├─ tests/...
└─ .ai/...
State files updated: PROJECT_STATE, TASK_BOARD, FILE_MAP, HANDOFF, TEST_REPORT, CHANGELOG
```

For Blocked:

```text
TASK STOPPED: T-XXX — <title>
Status: Blocked
Evidence: <specific failure or missing approval>
Attempts: <up to three concise attempts>
Safe repository state: Yes/No
Exact next action: <single actionable instruction>
Compact tree: <changed branches only>
```

## 5. Compact tree rules

- Show only changed branches and key state files.
- Maximum 40 lines.
- Collapse generated/vendor folders.
- Never show `node_modules`.
- Never expose secret filenames beyond standard env names.
- Add one-line descriptions only for newly introduced important files.

Example:

```text
src/
├─ features/merge-pdf/
│  ├─ MergePdfTool.tsx
│  ├─ merge-pdf.schema.ts
│  └─ merge-pdf.test.ts
├─ lib/pdf/operations/merge.ts
└─ workers/pdf.worker.ts
tests/
└─ e2e/merge-pdf.spec.ts
.ai/
├─ HANDOFF.md
├─ FILE_MAP.md
└─ TEST_REPORT.md
```

## 6. Handoff template

`.ai/HANDOFF.md` must contain:

```markdown
# Current Handoff

Updated: YYYY-MM-DD HH:mm TZ
Milestone: M1
Repository state: clean | uncommitted | blocked

## Last completed task
- ID:
- Title:
- Result:
- Commit/reference:

## Changed files
- path — reason

## Verification evidence
- command — result
- browser journey — result

## Current capability
One paragraph describing what a user can actually do now.

## Next ready task
- ID:
- Why it is next:
- Read these files only:
- Acceptance gate:

## Known issues/blockers
- issue, severity, workaround, owner

## Do not redo
- accepted decisions and finished work
```

## 7. File-map template

For each important path:

```markdown
- `src/lib/pdf/contracts.ts` — shared typed contracts used by UI, workers, and adapters. Read before changing any operation.
```

Remove stale paths immediately after moves/renames.

## 8. Decision record format

```markdown
## ADR-005 — Static-first public routes
Date: 2026-07-18
Status: Accepted
Decision: Public tools cannot require Next server functions.
Reason: free commercial-friendly hosting portability and local processing.
Alternatives: Vercel-only server runtime; dedicated backend.
Consequences: admin is client-rendered with Supabase RLS; some features deferred.
```

## 9. Test-report format

```markdown
# Test Report

## Latest full verification
- Date:
- Commit:
- Node/package manager:
- lint:
- typecheck:
- unit:
- integration:
- E2E Chromium:
- E2E Firefox:
- E2E WebKit:
- accessibility:
- build:
- performance:

## Task-level verification
### T-XXX
- commands
- fixtures
- result

## Not yet tested
- exact gap and task owner
```

## 10. Source-reading budget

Before opening a file, the agent should answer: “Is this file needed to meet the current acceptance gate?” If not, do not open it.

Prefer:

- symbol search;
- small line ranges;
- `FILE_MAP.md`;
- test failure locations;
- Git diff.

Avoid:

- repeatedly reading full generated files;
- reading every component to understand one feature;
- pasting entire files into chat;
- restating all previous decisions.

## 11. Switching AI tools

When moving from one AI to another, give the new AI this prompt:

```text
You are continuing an existing repository. Do not restart or redesign it. Read START_HERE.md, then .ai/PROJECT_STATE.md, .ai/HANDOFF.md, .ai/TASK_BOARD.md, and .ai/FILE_MAP.md. Execute only the Next ready task recorded in .ai/HANDOFF.md. Respect existing decisions in .ai/DECISIONS.md. At completion, update all required state files and emit the compact completion report from 08_DEVELOPMENT_LOOP_AND_HANDOFF.md.
```

## 12. Commit convention

```text
feat(tool): T-120 add merge PDF workflow
fix(pdf): T-124 handle mixed page rotations
ui(workspace): T-080 improve mobile file list
admin(ads): T-310 add placement kill switch
test(e2e): T-405 cover cancelled processing
docs(state): T-406 update release handoff
```

One task may have multiple commits, but the handoff should identify the final integrated state.

---

**Next read:** `09_TESTING_SECURITY_PERFORMANCE.md`
