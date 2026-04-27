# Discussion Log: Phase 1 - Repo Operating Model
**Date:** 2026-04-26

## Summary
The discussion focused on simplifying the repository structure to improve developer experience and deployment safety. The major decision is to transition from a monorepo setup to a standard root-level Next.js app.

## Selected Areas

### 1. Reference Repo Isolation
- **User's Decision:** Move to a dedicated `/reference` folder and exclude it in `.gitignore`.
- **Details:** `tmc-scion` and `tmc-characters-maker` are local reference only and should not enter Git history or Vercel scope.

### 2. Root Scripting Strategy
- **User's Decision:** Comprehensive root scripts.
- **Details:** The monorepo root should act as the primary interface for `dev`, `build`, `lint`, and `typecheck`.

### 3. Documentation Placement
- **User's Decision:** A new `DEVELOPMENT.md` in the root.
- **Details:** Separate from the high-level README to provide technical onboarding.

### 4. Legacy Archive Structure
- **User's Decision:** Move previous phase directories to an archive.
- **Details:** Archive Milestone v2.0 history to `.planning/archive/v2.0/`.

### 5. Repository Nesting
- **User's Feedback:** "apps/tma-client doesn't seem like a good architecture... it feels unnecessary and makes it more difficult to deploy on vercel."
- **Consensus:** Flatten the repository by moving `tma-client` to the root.

### 6. Modular Boundaries
- **User's Feedback:** "maybe we can use something more modular."
- **Consensus:** Carry this requirement into Phase 2 to refine the internal module/feature boundaries.
