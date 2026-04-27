# Feature Landscape

**Domain:** Repository and architecture improvements for a Next.js gameplay app preparing for deployment
**Researched:** 2026-04-26
**Milestone:** v2.1 Repository & Architecture Improvements
**Confidence:** MEDIUM-HIGH

## Milestone Framing

This milestone should improve deployability, maintainability, and change safety for `apps/tma-client` without rewriting the game. The current repo already has the right broad direction: a root npm workspace, a primary app in `apps/tma-client`, a reserved `packages/` directory, feature-oriented folders under `src/features`, and Supabase SSR helpers under `src/lib/supabase`. The main problem is inconsistency, not lack of structure.

For that reason, this milestone should be a boundary-hardening refactor, not a product rewrite. The target outcome is a repo that is easier to deploy, reason about, and extend with smaller blast radius when features change.

## Table Stakes

Features users and maintainers should expect before deployment-oriented architecture work is considered complete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear monorepo operating model | A deployment-ready repo needs explicit ownership of `apps/`, `packages/`, scripts, and ignored reference repos | Low | Keep `apps/tma-client` as the only production app for this milestone; treat cloned repos as references only |
| Consistent module boundaries inside `tma-client` | Feature folders already exist, so inconsistent placement of infra, UI, and domain logic is now technical debt | Medium | Standardize what belongs in `src/app`, `src/features`, `src/components`, `src/lib`, and `src/store` |
| Server/client data access rules | Next.js App Router rewards server-first data fetching and smaller client bundles | Medium | Prevent Supabase queries from spreading arbitrarily through client components |
| Safe shared layer for app-wide primitives | Deployment work needs a predictable place for cross-feature utilities, types, and shared UI | Low | Use app-local shared modules first; only move to `packages/` when reuse across apps is real |
| Performance guardrails | The app contains large client components and realtime screens, so performance can regress silently | Medium | Add bundle/render/query guardrails before deep optimization |
| Deployment readiness baseline | Production deployment requires build clarity, env clarity, auth/session correctness, and repeatable scripts | Medium | Focus on "can build, can configure, can run safely", not full platform migration |
| Refactor guardrails | Architecture refactors are risky without checks | Medium | Add lint/import rules, ownership conventions, and targeted smoke coverage before invasive moves |

## Feature Categories

### Repo Topology

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Declare `apps/tma-client` as the primary deployable app | Current workspace contains multiple app-like directories, but only one is active for production | Low | Document production scope at root and in app README/config |
| Normalize workspace scripts | Deployment and CI should not depend on ad hoc per-folder commands | Low | Add root scripts for lint, build, typecheck, and targeted app commands |
| Define package promotion rules | `packages/` exists but is empty; without rules, shared code will sprawl | Low | Only promote code when used by more than one app or when infra abstraction is stable |
| Separate reference repos from production architecture decisions | Cloned repos are useful context but should not shape runtime coupling | Low | Keep them ignored by git and excluded from milestone deliverables |

### Module Boundaries

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Route layer stays thin | `src/app` should compose pages, not hold domain logic | Medium | Keep pages/layouts focused on loading, auth gating, and composition |
| Feature modules own domain UI plus domain data adapters | Current `src/features/*` shape is good but unevenly enforced | Medium | Each feature should own components, queries/mutations, and types that are not app-global |
| App-level shell components isolated from feature code | Global listeners, registries, and initializers are cross-cutting concerns | Medium | Keep these in an explicit app shell layer instead of mixing with feature modules |
| Shared UI/utilities deduplicated | Duplicate uploader/cropper components already exist in multiple locations | Low | Consolidate duplicate shared pieces before broader package extraction |
| Store boundary reduced to true cross-feature session/game shell state | A broad Zustand store increases coupling and refactor risk | Medium | Keep store for global session/game shell only; push feature-local state downward |

### Data Layer

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Distinguish browser queries from server queries | Next.js defaults to Server Components; data boundaries should reflect that | Medium | Prefer server-side reads for route entry data and privileged aggregation |
| Centralize Supabase access patterns per feature | Current query logic is scattered across client components and long `api.ts` files | Medium | Create feature-scoped query/mutation modules with clear server/client suffixes |
| Typed query contracts at the feature boundary | Deployment-safe refactors need predictable payload shapes | Medium | Reuse generated DB types, but expose feature-facing types instead of raw table shapes everywhere |
| Mutation safety for high-impact flows | Character movement, poll state, possession, and admin actions have gameplay consequences | High | Wrap risky multi-step writes behind dedicated actions/services before changing behavior |
| Env and auth assumptions made explicit | Supabase SSR is configured, but environment usage should be validated and documented | Low | Add env validation and server-only/client-only boundaries |

### Performance

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Reduce oversized client boundaries | Large interactive components currently carry data fetching and rendering together | Medium | Split loaders/controllers from visual components; keep `"use client"` as low as possible |
| Remove duplicated fetch/subscription work | Realtime UIs and map/room views are likely to over-fetch | Medium | Consolidate subscriptions and avoid parallel duplicate queries per screen |
| Add bundle visibility | Next.js production guidance expects bundle analysis before shipping | Low | Add an analyzable build path or equivalent reporting |
| Target hot paths only | Performance work should focus on dashboard, room, map, listeners, and global overlays | Low | Do not attempt repo-wide micro-optimization |

### Deployment Readiness

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Production build passes from repo root | Monorepo deployment needs one obvious build path | Low | Root scripts should build `tma-client` reliably |
| Environment contract documented and validated | Deployments fail more often from config drift than code | Low | Document required Supabase and AI env vars; fail fast when missing |
| Auth/session path verified | App depends on middleware-based Supabase session refresh | Medium | Ensure route protection and redirect logic remain intact after refactors |
| Minimal CI gate set | Architecture changes need automated checks | Medium | Lint, typecheck, and production build should be the minimum gate |

### Guardrails

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Import direction rules | Single-responsibility modules fail when cross-feature imports become arbitrary | Medium | Enforce allowed dependencies: route -> feature/app shell -> shared/lib |
| Refactor safety checks | Broad moves need fast feedback | Medium | Add smoke coverage around auth entry, dashboard load, room navigation, and admin critical paths |
| ADR-style conventions for placement decisions | Repo topology changes drift without written rules | Low | Short conventions doc is enough for this milestone |
| "No behavior change unless intentional" rule | Architecture milestones can accidentally become feature work | Low | Track any behavior changes separately and keep them explicit |

## In Scope This Milestone

Prioritize:

1. Repo topology cleanup for the active production app
2. Stronger module placement rules inside `apps/tma-client`
3. Data-layer extraction that reduces direct Supabase usage inside large client components
4. Low-risk shared-component deduplication
5. Deployment guardrails: root scripts, env contract, lint/type/build gates
6. Performance guardrails and targeted hot-path improvements where extraction naturally helps

Specific in-scope work by category:

| Category | In Scope | Why |
|----------|----------|-----|
| Repo topology | Root scripts, workspace conventions, active-app documentation, package promotion rules | Improves operability without changing runtime behavior |
| Module boundaries | Thin route files, explicit feature ownership, shared/UI dedupe, app shell isolation | Directly addresses single-responsibility goal |
| Data layer | Feature-scoped query/mutation modules, server/client split, typed contracts, env validation | Highest leverage architectural improvement with manageable risk |
| Performance | Reduce oversized client boundaries, remove obvious duplicate queries/subscriptions, add bundle visibility | Safe if tied to boundary cleanup |
| Deployment readiness | Build/type/lint path, env docs, auth/session verification, basic CI entrypoint | Required before deployment work is credible |
| Guardrails | Import rules, conventions, smoke checks for critical flows | Prevents regression during and after refactor |

## Deferred

| Feature | Why Defer | What to Do Instead |
|---------|-----------|-------------------|
| Full migration of all shared code into `packages/` | Premature extraction will create artificial package boundaries and increase build complexity | Keep sharing app-local unless another app truly consumes it |
| Database schema redesign | Changes to tables, relationships, and RLS are high-blast-radius and not necessary for basic architecture cleanup | Improve access patterns first; plan schema work as a separate milestone |
| Rewriting gameplay state management from Zustand to another model | High migration cost with unclear payoff for this milestone | Reduce scope of the existing store and extract logic around it |
| Rebuilding 3D exploration or realtime architecture | Too risky for a repo-improvement milestone | Isolate hot paths and add guardrails instead |
| Full test-suite creation across the whole app | Valuable, but too large if started from zero during a refactor-heavy milestone | Add focused smoke/integration coverage on critical flows only |
| Cross-app unification of `tmc-characters-maker` and `tmc-scion` | Not required to prepare `tma-client` for deployment | Document future package candidates discovered during refactor |
| Aggressive caching/revalidation redesign | Can cause correctness bugs in a multiplayer/realtime game | Make fetch boundaries explicit first, then tune caching later |

## Low-Risk vs High-Risk Refactor Areas

### Low-Risk Refactor Areas

| Area | Why Low Risk | Recommended Action |
|------|--------------|-------------------|
| Root workspace scripts and docs | No runtime gameplay impact | Add `lint`, `typecheck`, `build`, and deployment docs from root |
| Duplicate shared UI components | Mostly local UI reuse issue | Consolidate uploader/cropper components into one shared home |
| Thin route composition | Structural cleanup with low behavior risk | Move business logic out of pages/layouts into feature modules |
| Env validation and config docs | Fails fast without changing domain logic | Introduce validated env access and deployment checklist |
| Import/convention guardrails | Preventive rather than behavioral | Add lint aliases/rules and short placement conventions |

### High-Risk Refactor Areas

| Area | Why High Risk | Recommended Action |
|------|---------------|-------------------|
| `src/store/useTmaStore.ts` decomposition | Global state touches dashboard, rooms, overlays, and identity flows | Split only along clear seams; keep public selectors/actions stable during milestone |
| `src/features/exploration/components/InsideRoomArena.tsx` extraction | Large component likely mixes room loading, movement, privacy, messaging, and realtime behavior | Extract read-only helpers first, then isolate mutations behind actions |
| `src/features/admin/api.ts` restructuring | Long module likely contains privileged and high-impact mutations | Separate read vs write paths first; add typed contracts and critical-flow smoke checks |
| Client-side Supabase calls in interactive screens | Moving reads/writes across server/client boundaries can change timing and auth assumptions | Start with route-entry reads and non-realtime queries; keep realtime browser subscriptions where needed |
| Auth/session middleware adjustments | Mistakes can lock users out or create redirect loops | Keep existing flow intact; only tighten validation and coverage unless a defect is proven |

## Refactor Sequence Recommendation

Feature dependencies:

```text
Repo topology conventions -> module boundary rules -> shared UI dedupe -> data layer extraction -> performance cleanup -> deployment guardrails
Guardrails run in parallel and should start before high-risk refactors
```

## MVP Recommendation

Prioritize:

1. Repo topology and root developer/deployment scripts
2. Module boundary cleanup inside `apps/tma-client`
3. Data-layer extraction for the most coupled/high-traffic areas
4. Deployment guardrails and minimal CI checks

Defer:

- Full package extraction: wait until cross-app reuse is proven
- Schema/RLS redesign: separate milestone
- State-management rewrite: separate milestone
- Broad performance tuning: only fix issues exposed by the boundary refactor

## Scope Rule

This milestone should ship a cleaner architecture with lower blast radius, not a different game. If a refactor changes player-visible behavior, that change should be treated as an explicit sub-scope item and validated separately.

## Sources

- Internal codebase analysis: `.planning/codebase/STRUCTURE.md`, `package.json`, `apps/tma-client/package.json`, `apps/tma-client/src/store/useTmaStore.ts`, `apps/tma-client/src/features/admin/api.ts`, `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`, `apps/tma-client/src/lib/supabase/*`
- Next.js production checklist, App Router docs, last updated February 27, 2026: https://nextjs.org/docs/app/guides/production-checklist
- Next.js Server and Client Components guide, last updated March 16, 2026: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js `transpilePackages` config reference, last updated February 27, 2026: https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
- Supabase Next.js SSR guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase SSR overview, crawled 2026: https://supabase.com/docs/guides/auth/server-side
