# Plan: Phase 1 - Repo Operating Model
**Phase Number:** 1
**Status:** Ready for Execution
**Wave:** 1

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  WAVE 1: ISOLATION & ARCHIVE
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### [Task 1.1] Move Reference Repositories
- **autonomous:** true
- **requirements:** REPO-03
- **read_first:** 
  - .gitignore
- **action:** 
  - Create directory `reference/` at the root.
  - Move `tmc-scion` and `tmc-characters-maker` into `reference/`.
- **acceptance_criteria:** 
  - `reference/tmc-scion` exists.
  - `reference/tmc-characters-maker` exists.
  - No `tmc-scion` or `tmc-characters-maker` folders remain in the root.

### [Task 1.2] Update Git Isolation
- **autonomous:** true
- **requirements:** REPO-03
- **read_first:** 
  - .gitignore
- **action:** 
  - Update `.gitignore` to remove `/tmc-scion/` and `/tmc-characters-maker/`.
  - Add `/reference/` to `.gitignore`.
- **acceptance_criteria:** 
  - `.gitignore` contains `/reference/`.
  - `.gitignore` no longer contains the individual repo paths.

### [Task 1.3] Archive Legacy Phase History
- **autonomous:** true
- **requirements:** REPO-01
- **read_first:** 
  - .planning/phases
- **action:** 
  - Create directory `.planning/archive/v2.0/`.
  - Move all existing phase directories in `.planning/phases/` (except the current `01-repo-operating-model`) to the archive.
- **acceptance_criteria:** 
  - `.planning/archive/v2.0/` contains previous phase folders.
  - `.planning/phases/` only contains the current phase directory.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  WAVE 2: REPOSITORY FLATTENING
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### [Task 2.1] Migrate Source and Config to Root
- **autonomous:** true
- **requirements:** REPO-01, REPO-02
- **read_first:** 
  - apps/tma-client/package.json
- **action:** 
  - Use `git mv` to move the following from `apps/tma-client/` to the root:
    - `src/`
    - `public/`
    - `app/` (if it exists outside src)
    - `next.config.mjs`
    - `tailwind.config.ts`
    - `tsconfig.json`
    - `.env.local`
- **acceptance_criteria:** 
  - `src/`, `public/`, `next.config.mjs`, etc., are now in the repository root.

### [Task 2.2] Repository Cleanup
- **autonomous:** true
- **requirements:** REPO-01
- **read_first:** 
  - apps/
- **action:** 
  - Remove the `apps/` and `packages/` directories once they are empty.
  - Remove `apps/tma-client/package.json` (after dependencies are hoisted in Wave 3).
- **acceptance_criteria:** 
  - `apps/` and `packages/` folders no longer exist.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  WAVE 3: MANIFEST & DOCS
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### [Task 3.1] Hoist Dependencies and Refactor Scripts
- **autonomous:** true
- **requirements:** REPO-01
- **read_first:** 
  - package.json
  - apps/tma-client/package.json
- **action:** 
  - Copy all `dependencies` and `devDependencies` from `apps/tma-client/package.json` to the root `package.json`.
  - Remove `workspaces` from root `package.json`.
  - Update root scripts:
    - Remove `dev:client`, `build:client`.
    - Add `dev`: `next dev`.
    - Add `build`: `next build`.
    - Add `start`: `next start`.
    - Add `lint`: `next lint`.
    - Add `typecheck`: `tsc --noEmit`.
- **acceptance_criteria:** 
  - Root `package.json` contains all necessary dependencies for the Next.js app.
  - Scripts are standard for a Next.js project.

### [Task 3.2] Create Development Documentation
- **autonomous:** true
- **requirements:** REPO-02
- **read_first:** 
  - README.md
- **action:** 
  - Create `DEVELOPMENT.md` at the root with instructions on how to run, build, and deploy the app.
  - Reference that `apps/tma-client` has been moved to the root.
- **acceptance_criteria:** 
  - `DEVELOPMENT.md` exists and is accurate.

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
##  WAVE 4: VERIFICATION
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### [Task 4.1] Synchronize Environment
- **autonomous:** true
- **requirements:** REPO-01
- **read_first:** 
  - package.json
- **action:** 
  - Run `npm install` in the root to regenerate `package-lock.json` and sync the hoisted dependencies.
- **acceptance_criteria:** 
  - `npm install` completes successfully.
  - `node_modules` is populated in the root.

### [Task 4.2] Production Readiness Gate
- **autonomous:** true
- **requirements:** REPO-01
- **read_first:** 
  - package.json
- **action:** 
  - Run `npm run typecheck`.
  - Run `npm run lint`.
  - Run `npm run build`.
- **acceptance_criteria:** 
  - All verification scripts exit with code 0.
