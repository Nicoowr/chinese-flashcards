# CI Workflow

This repository uses GitHub Actions for continuous integration on the frontend.

## What the CI does

The CI workflow runs on:
- Push to `main`, `master`, or `gitbutler/workspace` branches
- Pull requests targeting `main` or `master` branches

It performs the following checks on the frontend:

1. **Type Checking**: Runs TypeScript compiler in no-emit mode
2. **Linting**: Runs ESLint with Next.js configuration
3. **Testing**: Runs tests using Vitest

## Scripts

### Frontend
- `pnpm run type-check` - Type check frontend code
- `pnpm run lint` - Lint frontend code (uses Next.js ESLint config)
- `pnpm run test` - Run tests using Vitest
- `pnpm run test:watch` - Run tests in watch mode

## Local Development

To run the checks locally:

```bash
# Install frontend dependencies
cd frontend
pnpm install

# Run all checks
pnpm run type-check
pnpm run lint
pnpm run test
```
