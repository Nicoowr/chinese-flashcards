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
4. **Dependency release age**: Checks every package in `pnpm-lock.yaml` against
   npm publication dates and rejects releases younger than seven days, including
   transitive and optional dependencies. Missing dates or registry failures also
   fail the check. This job runs before linting and tests; its dependency install
   disables lifecycle scripts. pnpm 10's frozen installs alone do not enforce
   `minimumReleaseAge` for versions already in the lockfile.

The workspace sets `minimumReleaseAge: 10080` (seven days in minutes). The CI
check rejects a lower setting and honors a higher setting. Every locked package
must satisfy the policy, even if listed in `minimumReleaseAgeExclude`. Non-registry
package sources fail because their npm publication dates cannot be verified.

Run the check from the repository root with `pnpm check:release-age` (requires
access to the public npm registry), and its offline tests with
`pnpm test:release-age`.

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
