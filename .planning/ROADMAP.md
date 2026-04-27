# Roadmap: Milestone v2.1 - Repository & Architecture Improvements

## Overview
This milestone resets phase numbering to `Phase 1` and focuses on making the active gameplay app easier to deploy, maintain, and refactor safely. The work stays inside the current monorepo shell, keeps the reference repos local-only, and improves architecture through incremental boundary hardening rather than a big-bang rewrite.

## Proposed Roadmap

**4 phases** | **13 requirements mapped** | All milestone requirements covered

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Repo Operating Model | Clarify what the production app is, how the workspace is operated, and how reference repos stay out of the deploy surface. | REPO-01, REPO-02, REPO-03 | 4 |
| 2 | Module Boundary Foundation | Establish canonical architecture boundaries, shared ownership rules, and low-risk file/layout consolidation. | ARCH-01, ARCH-02, ARCH-03, ARCH-04 | 4 |
| 3 | Data and State Seams | Reduce coupling around Supabase access, store boundaries, and database process ownership without breaking gameplay behavior. | DATA-01, DATA-02, DATA-03 | 4 |
| 4 | Deployment and Performance Hardening | Finish the milestone with Vercel-ready deployment guidance, minimum safety gates, and targeted hot-path performance cleanup. | PERF-01, DEP-01, DEP-02 | 4 |

## Phase 1: Repo Operating Model
**Goal:** Make the repository's production shape explicit and safe to operate.

**Requirements:** `REPO-01`, `REPO-02`, `REPO-03`

**Success criteria:**
1. Root scripts clearly operate the active app for development, build, lint, and typecheck.
2. The repo documents that `apps/tma-client` is the deployable app and that Vercel should target that path.
3. `tmc-scion` and `tmc-characters-maker` remain present locally but do not enter commit or deployment scope.
4. Legacy phase history is archived so the v2.1 roadmap can safely restart at `Phase 1`.

## Phase 2: Module Boundary Foundation
**Goal:** Create a consistent internal architecture that separates route composition, domain modules, shared primitives, infrastructure, and app-shell concerns.

**Requirements:** `ARCH-01`, `ARCH-02`, `ARCH-03`, `ARCH-04`

**Success criteria:**
1. The app has a documented placement model for route files, modules, shared code, infrastructure, and state.
2. Global runtime components/listeners are grouped under an explicit app-shell boundary.
3. Duplicated shared UI or utilities touched by the refactor have one canonical home.
4. Route files touched in this phase are thinner and no longer act as generic feature dumping grounds.

## Phase 3: Data and State Seams
**Goal:** Extract safer boundaries around Supabase usage, store responsibilities, and database process ownership.

**Requirements:** `DATA-01`, `DATA-02`, `DATA-03`

**Success criteria:**
1. Selected hot-path features use repositories/services instead of direct Supabase calls from render-heavy components.
2. Browser, server, and middleware Supabase helpers remain runtime-safe and clearly separated.
3. Store refactor work preserves behavior while reducing broad cross-feature coupling.
4. One documented database migration/type ownership path exists for the active app.

## Phase 4: Deployment and Performance Hardening
**Goal:** Make the cleaned-up app safer to ship and cheaper to evolve.

**Requirements:** `PERF-01`, `DEP-01`, `DEP-02`

**Success criteria:**
1. Vercel deployment expectations are documented, including root directory and required environment variables.
2. Lint, typecheck, and production build verification exist as the minimum refactor gate for the active app.
3. At least one high-risk gameplay surface has reduced client-boundary or duplicate-subscription/query overhead.
4. The milestone closes with a documented list of remaining high-risk refactor follow-ups rather than hidden churn.

## Sequencing Notes
- Keep `apps/tma-client` as the active app root for this milestone.
- Do not move the app to repo root.
- Prefer incremental strangler-style moves with compatibility shims where needed.
- Treat any player-visible behavior change as explicit scope, not as an accidental side effect of cleanup.

---
*Created: 2026-04-26*
*Current Version: v2.1-planning*
