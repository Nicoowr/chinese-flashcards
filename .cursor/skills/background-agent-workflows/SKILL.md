---
name: background-agent-workflows
description: Create specification files for background agent workflows. Use when the user asks to create a spec, define tasks for background agents, or plan work to be executed by autonomous agents in the .background-agents-workflows/ directory.
---

# Background Agent Workflow Specs

Create `.spec.md` files that background agents pick up and execute autonomously. Each spec defines a sequence of tasks, each small enough for one agent session.

## Before Writing a Spec

1. **Understand the goal**: what codebase change is needed end-to-end?
2. **Audit the current state**: read the relevant files, run linters/tests, identify the exact scope.
3. **Decompose into tasks**: each task = one agent session = one PR. A task should touch at most 3-8 files.

## Spec File Format

Place specs in `.background-agents-workflows/<spec-name>.spec.md`. Follow the template at `.background-agents-workflows/TEMPLATE.md` exactly:

```markdown
# Specification: [Feature Name]

**File**: `<spec-name>.spec.md`

## Overview

[1-2 sentence description]

## Progress

| # | Task | Status |
|---|------|--------|
| 1 | [Task title] | ⬚ pending |
| 2 | [Task title] | ⬚ pending |

## Tasks

### Task N: [Title]

- **Status**: pending

**Context:**

[What the previous task accomplished and how this one builds on it.
What the next task will do (so the agent knows the scope boundary).]

**Instructions:**

[Detailed, unambiguous instructions]

**Verification:**

- [ ] [Concrete verification step]

---

## Notes

- [Context, dependencies, constraints]
```

### Required fields per task

| Field | Purpose |
|-------|---------|
| **Status** | Always `pending` for new specs (orchestrator sets `in-progress`) |
| **Context** | What the previous task produced and what the next task will handle — gives the agent continuity awareness |
| **Instructions** | Exact files to create/modify, what to change, code examples when helpful |
| **Verification** | Runnable commands (`pnpm build`, `pnpm check`, `pnpm test:e2e --grep "..."`) |

### Progress table

Every spec must include a `## Progress` table between Overview and Tasks. It gives agents (and humans) an at-a-glance view of how far the plan is.

The status icons are:
- `⬚ pending` — not started
- `🔄 in-progress` — current task
- `✅ completed` — merged

The orchestrator automatically updates this table when marking tasks completed/in-progress. When writing the spec, populate it with all tasks as `⬚ pending`.

### Task context

Each task must include a `**Context:**` section before Instructions. This is the single most impactful section for agent quality — without it, agents waste time re-discovering what the previous task already established.

Write context that answers three questions:
1. **What came before?** — Summarize what the immediately previous task produced (files created, APIs added, patterns established). For Task 1, explain why this task comes first and what groundwork it lays.
2. **What does this task do?** — One sentence framing the task's role in the overall plan.
3. **What comes next?** — Briefly state what the next task will handle so the agent knows where to stop. For the last task, state that this completes the feature.

## Retrocompatibility Rules

Every task MUST be fully backwards compatible. The codebase must work correctly after each task's PR is merged independently.

### Mandatory guardrails

1. **No breaking changes**: existing features, APIs, and behavior must remain intact after every single task.
2. **Feature-flag new behavior**: if a task introduces a new flow that replaces an existing one, gate it behind a feature flag. The old flow must keep working when the flag is off.
3. **Additive-first**: prefer adding new files/functions over modifying existing ones. When modification is required, preserve the existing signatures and behavior.
4. **Independent PRs**: each task produces one PR. The codebase must pass `pnpm build` and `pnpm check:all` after merging any single task's PR, regardless of whether subsequent tasks have been completed.
5. **No cross-task assumptions**: a task must not depend on uncommitted state from another in-progress task. If task N depends on task N-1, state it explicitly in the Notes section.
6. **Verification includes regression checks**: every task's verification must include at least:
   - `pnpm build` succeeds
   - `pnpm check` (or `pnpm check:all`) passes
   - Any relevant E2E tests still pass (if the area has coverage)

### Patterns for safe changes

| Change type | Retrocompatible approach |
|---|---|
| Replace existing flow | Feature-flag the new flow; old flow untouched when flag is off |
| Remove unused code | Delete only what's provably unused (knip, grep). Verify build. |
| Refactor component internals | Keep the same props/API surface; only change implementation |
| Add new endpoint/route | Purely additive — no existing routes change |
| Change data schema | Add new optional fields; never remove or rename existing fields |
| Convex: add mandatory field | **Must be split across PRs** — see "Convex Schema Migrations" below |
| Convex: rename/remove field | **Must be split across PRs** — see "Convex Schema Migrations" below |
| Enforce a lint rule | First fix all violations (tasks 1-N), then enable the rule (final task) |

### Convex Schema Migrations

Convex does not support traditional migrations. Schema changes that would break existing data **must be split across separate tasks/PRs** so that each step is independently deployable and safe.

#### Adding a mandatory field

1. **Task N — Add the field as optional + backfill**: Add the field to the schema as optional. Write a migration or backfill script that populates the field for all existing rows. Update write paths to always set the new field. Deploy.
2. **Task N+1 — Make the field mandatory**: Once all rows have the field populated (backfill is confirmed complete), change the schema to make the field required. Remove any optional handling that is no longer needed. Deploy.

#### Renaming a field

1. **Task N — Add the new field**: Add the new field (optional) alongside the old one. Update write paths to populate both fields. Backfill the new field from the old field for existing rows.
2. **Task N+1 — Migrate readers**: Update all read paths to use the new field instead of the old one.
3. **Task N+2 — Remove the old field**: Drop the old field from the schema and remove any dual-write logic.

#### Removing a field

1. **Task N — Stop writing the field**: Remove all write paths that set the field. Remove all read paths that depend on it.
2. **Task N+1 — Remove from schema**: Remove the field from the Convex schema definition.

#### Key principle

Each PR must result in a deployable state where the Convex schema is consistent with the data that exists in the database. Never deploy a mandatory schema field before all existing rows have been backfilled.

## Writing Good Instructions

### Be explicit — agents have no prior context

- List exact file paths (relative to repo root, e.g. `apps/frontend/src/components/foo.tsx`)
- Show the current code pattern and the desired replacement when refactoring
- Include code snippets for non-obvious implementations
- Reference existing files as examples when a pattern should be followed

### Size tasks appropriately

- **Too small**: "rename one variable" — not worth an agent session
- **Too large**: "refactor the entire data layer" — agent can't finish in one session
- **Right size**: "refactor 3 components to use design system Stack components" — clear scope, finishable

### Use the project's coding standards

Always remind the agent of relevant standards in the Notes section:
- Arrow functions, functional style, no `for`/`let`
- `isDefined`/`isNotDefined` for null checks
- Design system components from `@/components/ui/`
- Callee-first function ordering

## Task Ordering Strategies

### Linear dependency chain
Each task builds on the previous. State dependencies explicitly.

```markdown
## Notes
- Tasks are sequential: each depends on the previous task being merged.
```

### Parallel-safe tasks
Group independent tasks early, dependent tasks later.

```markdown
## Notes
- Tasks 1-3 can be developed in parallel (no shared file modifications).
- Task 4 depends on tasks 1-3 being complete.
```

### The "fix then enforce" pattern
For lint rules, style enforcement, or migrations:
1. Tasks 1-N: fix all existing violations (grouped by file/area)
2. Final task: enable the rule as an error

## Verification Best Practices

Always include runnable commands. Good examples:

```markdown
- [ ] `pnpm build` succeeds without errors
- [ ] `pnpm check:all` passes
- [ ] `pnpm test:e2e --grep "upload flow"` passes
- [ ] `npx biome lint src/path/to/file.tsx --only=style/noNestedTernary` returns no violations
- [ ] `pnpm knip` reports no new unused exports
```

For UI changes, request a screenshot:

```markdown
- [ ] Screenshot of the component rendering correctly saved to `.screenshots/`
```

## Notes Section Checklist

The Notes section at the bottom of the spec should include:

- Task dependency information (sequential vs. parallel)
- Relevant coding standards reminders
- Pointers to reference files or existing patterns to follow
- The `pending` status reminder: "All tasks should start with status `pending`. The workflow will automatically detect new specs and mark the first task as `in-progress` when launching an agent."

## Workflow Context

The agent receives instructions from `.background-agents-workflows/AGENT.md`:
- Branch naming: `agent/<spec-name>/task-<number>`
- PR title: starts with `[Agent]`
- PR body must include `Spec: <filename>.spec.md`
- Agents do NOT update the spec file — the orchestrator handles status transitions on merge
- Completed specs are moved to `.background-agents-workflows/completed/`
