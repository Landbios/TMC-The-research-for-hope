# Research Summary

**Milestone:** v2.1 Repository & Architecture Improvements  
**Synthesized:** 2026-04-26

## Key Findings

### Stack and Repo Direction
- Keep `apps/tma-client` as the active deployable Next.js app.
- Keep the root workspace as an orchestration shell with clear `dev`, `build`, `lint`, and `typecheck` entrypoints.
- Keep `tmc-scion` and `tmc-characters-maker` in the workspace, but outside Git and deployment scope.
- Do not add Turborepo, Nx, package extraction, ORM churn, or repo-root app moves in this milestone.

### Architecture Direction
- Move toward a feature-first, screaming-architecture-style app layout without changing the deployment topology.
- Keep `src/app` thin and focused on routing, layout composition, auth gating, and route handlers.
- Introduce clearer boundaries between domain modules, shared primitives, infrastructure helpers, and state.
- Extract Supabase table access into repositories/services before attempting major UI decomposition.

### Refactor Priorities
- Define the repo operating model and canonical file placement rules first.
- Consolidate duplicated shared UI and utility code.
- Extract app-shell runtime components and character/session boundaries.
- Decompose the global Zustand store into stable slices or stable selectors before deeper feature refactors.
- Tackle exploration/dashboard/admin hot paths only after safer data and store seams exist.

### Deployment and Performance Guidance
- Use Vercel Root Directory targeting `apps/tma-client`.
- Make environment requirements explicit and validate them early.
- Add root scripts and minimum guardrails for lint, typecheck, and production build.
- Target performance by shrinking oversized client boundaries and consolidating duplicate queries/subscriptions instead of broad speculative optimization.

### Watch Out For
- Do not mix Supabase browser, server, and middleware helpers during cleanup.
- Do not move route/layout structure casually; App Router folder changes can alter runtime behavior.
- Do not split store shape and business rules in the same step.
- Do not let cloned/reference repos leak into tooling, search, or deployment assumptions.

## Recommended Milestone Shape

1. Foundation and repo operating model
2. Shared/infra/module consolidation
3. Data and state boundary extraction
4. Deployment hardening and targeted performance cleanup

## Sources

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
