# AI Routing Guide

Use progressive disclosure: start from generated entry files, then load deeper docs only when relevant.

<!-- BEGIN:shared.routing -->
## Task Routing

- Frontend UI/components work: read `docs/ai/core-rules.md` (`shared.design-system`) first
- Refactors/logic changes: read `docs/ai/core-rules.md` (`shared.coding-standards`) first
- Non-Claude request triage: read `docs/ai/core-rules.md` (`shared.request-relevance`) first
- Tool-specific behavior:
  - Cursor: `docs/ai/tooling/cursor.md`
  - Claude: `docs/ai/tooling/claude.md`

## Source-of-Truth Policy

- Canonical content lives in `docs/ai/*`
- Generated files are outputs only:
  - `CLAUDE.md`
  - `.cursor/rules/*.mdc`
- Never edit generated files directly
<!-- END:shared.routing -->
