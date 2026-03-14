# Contributing AI Rules

This repository uses a generated AI-rules workflow.

## Where to Edit
- Edit canonical files in `docs/ai/*`
- Do not edit generated files directly:
  - `CLAUDE.md`
  - `.cursor/rules/*.mdc`

## Commands
- Regenerate artifacts:
  - `pnpm sync:ai-rules`
- Verify artifacts are in sync:
  - `pnpm check:ai-rules`

## Pull Request Expectations
- Include rationale for rule changes (what changed and why).
- If changing policy, update `docs/ai/routing.md` as needed.
- Ensure `pnpm check:all` passes locally.

## Ownership
- Rule changes should be reviewed by maintainers responsible for developer tooling and CI.
- Keep rule scope tight; avoid broad additions without clear repository relevance.
