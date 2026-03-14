---
name: refactor-big-files
description: Refactor large files into well-structured folders following project coding standards. Use when the user asks to refactor, split, or break up a big file — or when a file exceeds ~200 lines and would benefit from decomposition. Covers both React component files (frontend) and backend function files.
---

# Refactor Big Files

Split oversized files into well-structured folders with single-responsibility modules. The target structure differs for React components vs backend functions.

## When to Apply

- File exceeds ~200 lines
- File mixes multiple concerns (data fetching + transforms + rendering, or query building + validation + helpers)
- User asks to "refactor", "split", "break up", or "clean up" a large file

## Step 1: Analyze the File

Read the file and identify:

1. **Concerns** — list each distinct responsibility (data fetching, transforms, validation, rendering, helpers, types)
2. **Dependencies** — which pieces depend on each other? Which are shared?
3. **Exports** — what does the rest of the codebase import from this file?

Search the codebase for all imports from the file to understand its public surface.

## Step 2: Plan the Split

### React Component Files (frontend)

Convert a flat component file into a feature folder:

```
# Before
src/components/user-profile.tsx        # 400+ lines

# After
src/components/user-profile/
├── __tests__/                         # Tests (if they exist)
├── components/
│   ├── user-profile.tsx               # Main component (pure renderer)
│   ├── user-avatar.tsx                # Sub-component extracted from JSX
│   └── user-stats.tsx                 # Sub-component extracted from JSX
├── hooks/
│   └── use-user-profile.ts           # Data fetching hook (TanStack Query)
├── types/
│   └── user-profile-types.ts         # All types for this feature
└── utils/
    └── derive-user-display-info.ts   # Pure transform functions
```

Separation rules:

- **components/**: Pure renderers. No `useQuery`, no `useMutation`, no `useEffect` for data fetching. Props in, JSX out. Extract sub-components when a JSX block is reused or represents a distinct UI section.
- **hooks/**: One hook per data concern. Use TanStack Query (`useQuery`/`useMutation`). Call transform functions from `utils/` inside `queryFn` to shape the data.
- **types/**: All `type` definitions for this feature. Export them for use by components, hooks, and utils.
- **utils/**: Pure functions (no React, no hooks). Transforms, formatters, validators, derivations. One function per file when the function is non-trivial.
- **__tests__/**: Move existing tests here. Name test files after the module they test (e.g., `derive-user-display-info.test.ts`).

### Backend Function Files

Convert a large function file into a folder named after the top-level function:

```
# Before
src/routes/upload.ts                   # 500+ lines

# After
src/routes/upload/
├── upload.ts                          # Top-level entry point (orchestrator)
├── validate-upload-params.ts          # Business logic sub-function (sibling)
├── process-file-chunks.ts            # Business logic sub-function (sibling)
├── build-upload-response.ts          # Business logic sub-function (sibling)
├── types/
│   └── upload-types.ts               # Types for this module
└── utils/
    └── format-file-size.ts           # Generic helpers (not business-specific)
```

Separation rules:

- **Entry point** (`upload.ts`): Reads like a story — calls sub-functions in sequence. Contains the exported function/route handler.
- **Sibling files**: Business logic sub-functions live as direct siblings of the entry point. One file per distinct responsibility, named after the function they export.
- **types/**: All types for this module, exported for siblings.
- **utils/**: Only for generic, reusable helper functions (formatting, parsing, etc.) — not business logic. If a helper is used by exactly one sibling, keep it colocated instead.

### Backend Route Bounded-Context Structure (preferred for complex routes)

When a route has clear boundaries (transport, storage/query access, domain logic), use this structure:

```
src/routes/forecast/bulk/
├── bulk.ts                              # Thin pass-through to api/
├── api/
│   ├── bulk-route.ts                    # Outside-facing handler
│   └── bulk-schema.ts                   # Route contract/schema
├── dependencies/
│   ├── query/
│   │   └── load-bulk-inputs.ts          # DB/query integration
│   ├── sse/
│   │   └── stream-events.ts             # Stream transport encoding
│   ├── storage/
│   │   └── job-artifacts.ts             # S3/Tigris artifact formatting
│   └── forecast/
│       └── build-run-forecast.ts        # External forecast client wiring
├── domain/
│   ├── run-bulk-job-stream.ts           # Core business workflow
│   ├── series-preparation.ts            # Domain transforms/rules
│   └── types.ts                         # Domain types
└── __tests__/
```

Rules for this structure:

- **`bulk.ts` stays a pass-through**: import/export the api route entry, no business logic.
- **`api/` is outside-facing only**: route handlers + schema/contracts used by callers.
- **`dependencies/` owns external concerns**: SQL/duckdb, SSE wire format, object-storage artifacts, external forecast calls.
- **`domain/` owns business rules/workflows**: chunking, eligibility, state transitions, counters, internal composition.
- **No pass-through wrapper files**: do not create files that only `export * from ...`.
- **No duplicate source-of-truth**: after refactor, each module implementation exists in exactly one file path.

## Step 3: Execute the Refactor

Follow this order to avoid breaking imports:

1. **Create the folder** with the same name as the original file (minus extension)
2. **Create the types file first** — other files depend on types
3. **Create leaf modules** (utils, helpers, sub-functions) — no internal dependencies
4. **Create hooks / mid-level modules** — depend on utils and types
5. **Create the main component / entry point** — depends on everything
6. **Move tests** to `__tests__/` if they exist
7. **Update all external imports** across the codebase to point to the new paths
8. **Delete the original file**
9. **Delete temporary wrappers** (if any were created during migration in the same refactor)

## Step 4: Verify

1. Run `pnpm build` to confirm no broken imports
2. Run `pnpm check:all` to confirm linting and type checking pass
3. Run any relevant tests
4. Confirm no file in the refactor scope contains only `export * from ...`

## Coding Standards Checklist

Apply these to every file created during the refactor:

- [ ] Arrow functions only (no `function` declarations)
- [ ] Callee-first ordering (helpers defined before the functions that call them)
- [ ] `type` not `interface`; no optional `?` properties (use `| null`)
- [ ] `isDefined`/`isNotDefined` from `@/lib/utils` for null checks
- [ ] Functional style: no `for`, `let`, `.push()`, `.forEach()`, `.reduce()`
- [ ] Guard clauses and early returns (no nested conditionals)
- [ ] No dead code left behind
- [ ] Object parameters when a function has >2 params or 2 params of the same type
- [ ] Kebab-case file names
- [ ] Design system components (frontend only) — no raw HTML elements
- [ ] No `index.ts` barrel files
