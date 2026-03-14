# Cursor Tooling Rules

Cursor-specific rule overlays for generated `.cursor/rules/*.mdc` files.

<!-- BEGIN:cursor.additions -->
## Cursor Notes

- Keep `.cursor/rules/*.mdc` focused and readable.
- Prefer explicit examples only when they clarify intent.
- Keep rule titles stable so references in prompts remain valid.

## Backend Route Refactor Conventions

For complex backend route refactors with clear boundaries, prefer:

```
apps/backend/src/routes/<feature>/<route>/
├── <route>.ts                  # Thin pass-through to api route
├── api/                        # Outside-facing route entry + schema/contracts
│   ├── <route>-route.ts
│   └── <route>-schema.ts
├── dependencies/               # External boundaries (DB, storage, transport, external APIs)
│   ├── query/
│   ├── storage/
│   ├── sse/
│   └── ...
├── domain/                     # Business logic and internal workflows/types
│   ├── types.ts
│   └── ...
└── __tests__/
```

Requirements:
- Keep `<route>.ts` as a pass-through without business logic.
- Do not leave pass-through files that only `export * from ...`.
- After refactor, each module has a single source-of-truth file path.
- Update imports/tests to canonical paths in the same refactor.
<!-- END:cursor.additions -->
