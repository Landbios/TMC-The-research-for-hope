# Research: Phase 1 - Repo Operating Model

## Hardcoded Paths Audit
- **Result:** No hardcoded paths to `apps/tma-client` found in application source code or primary configuration files (`next.config`, `tailwind.config`, `tsconfig`).
- **Detected occurrences:** Only found in `package-lock.json`.
- **Conclusion:** Moving to root is safe from a path-resolution perspective.

## Git History Preservation
- **Strategy:** Use `git mv` for all source and configuration files.
- **Target Files:**
  - `src/` -> `/src`
  - `public/` -> `/public`
  - `app/` -> `/app`
  - `next.config.mjs` -> `/next.config.mjs`
  - `tailwind.config.ts` -> `/tailwind.config.ts`
  - `tsconfig.json` -> `/tsconfig.json`
  - `.env.local` -> `/.env.local`
- **Cleanup:** `apps/` and `packages/` can be deleted after confirming files are moved.

## Dependency Hoisting
- **Source:** `apps/tma-client/package.json`
- **Action:** Move all `dependencies` and `devDependencies` to the root `package.json`.
- **Script Refactoring:**
  - `dev:client` -> `dev`
  - `build:client` -> `build`
  - Add `lint` and `typecheck` at root.

## Reference Repositories
- **Current Status:** `tmc-scion` and `tmc-characters-maker` are independent git repositories.
- **Isolation:** Moving them to `/reference` is standard and prevents accidental staging.
- **Gitignore:** Update `.gitignore` to replace individual repo ignores with a single `/reference/` entry.

## Legacy Archiving
- **Plan:** Moving `.planning/phases/01-*` to `.planning/archive/v2.0/` (since these are from previous milestones).
- **Note:** The current `01-repo-operating-model` is Phase 1 of v2.1 and should NOT be archived yet.
