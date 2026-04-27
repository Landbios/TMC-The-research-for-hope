# Requirements: Milestone v2.1 - Repository & Architecture Improvements

## Overview
This milestone improves repository operability, internal architecture, deployment readiness, and low-risk performance/database boundaries for the active gameplay app in `apps/tma-client`. The goal is to reduce coupling and clarify ownership without changing the game's intended behavior.

## Milestone Requirements

### Repo Operations
- [ ] **REPO-01**: Maintainers can run the active app's `dev`, `build`, `lint`, and `typecheck` workflows from the repo root using explicit workspace-aware scripts.
- [ ] **REPO-02**: The repository documents that `apps/tma-client` is the only deployable production app for this milestone.
- [ ] **REPO-03**: The workspace keeps `tmc-scion` and `tmc-characters-maker` available locally while excluding them from Git commits and deployment scope.

### Module Boundaries
- [ ] **ARCH-01**: Route files under `apps/tma-client/src/app` are limited to routing, auth gating, data bootstrap, and screen composition concerns.
- [ ] **ARCH-02**: Product code is reorganized into clearer module, shared, infrastructure, and state boundaries with documented ownership rules.
- [ ] **ARCH-03**: Global runtime components and listeners are grouped under an explicit app-shell boundary instead of generic shared component folders.
- [ ] **ARCH-04**: Duplicated shared UI/utilities are consolidated into one canonical implementation per concern.

### Data and Runtime Boundaries
- [ ] **DATA-01**: Selected high-impact features can perform their Supabase reads and writes through dedicated repository or service modules instead of direct table access inside render-heavy components.
- [ ] **DATA-02**: Browser, server, and middleware Supabase helpers remain separated by runtime-safe boundaries with clear import conventions.
- [ ] **DATA-03**: Database migration and schema/type ownership is standardized to one documented process without breaking current gameplay behavior.

### Performance and Deployment
- [ ] **PERF-01**: The milestone reduces oversized client boundaries or duplicated subscriptions/queries in at least the highest-risk gameplay surfaces touched by the refactor.
- [ ] **DEP-01**: The app has a documented Vercel deployment contract, including app root, build path, and required environment variables.
- [ ] **DEP-02**: The repository provides a minimum refactor-safety gate of lint, typecheck, and production build verification for the active app.

## Future Requirements
- [ ] **FUT-01**: Extract stable multi-consumer code into `packages/*` only after reuse is proven.
- [ ] **FUT-02**: Revisit database schema redesign or RLS hardening in a dedicated milestone.
- [ ] **FUT-03**: Expand smoke/integration coverage into a broader automated test strategy.
- [ ] **FUT-04**: Reassess whether `tmc-scion` or `tmc-characters-maker` should ever become first-class workspace apps.

## Out of Scope
- Moving `apps/tma-client` to repo root
- Replacing Supabase, Next.js, or Zustand
- Rewriting gameplay loops for product changes instead of structural safety
- Merging the reference repos into the production app
- Large-scale schema redesign or risky cross-cutting database behavior changes

## Verification Criteria
- [ ] Root scripts and active-app deployment scope are explicit and working.
- [ ] Architecture ownership is documented and reflected in the file layout.
- [ ] Refactored hot paths preserve gameplay behavior while reducing coupling.
- [ ] Deployment documentation and environment expectations are clear enough for Vercel setup.
- [ ] Lint, typecheck, and production build verification cover the active app.

## Traceability

| Requirement | Phase |
|-------------|-------|
| REPO-01 | Phase 1 |
| REPO-02 | Phase 1 |
| REPO-03 | Phase 1 |
| ARCH-01 | Phase 2 |
| ARCH-02 | Phase 2 |
| ARCH-03 | Phase 2 |
| ARCH-04 | Phase 2 |
| DATA-01 | Phase 3 |
| DATA-02 | Phase 3 |
| DATA-03 | Phase 3 |
| PERF-01 | Phase 4 |
| DEP-01 | Phase 4 |
| DEP-02 | Phase 4 |
