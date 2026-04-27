# Domain Pitfalls

**Domain:** Repository and architecture refactor for a live Next.js + Supabase + Zustand application
**Researched:** 2026-04-26
**Overall confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Refactoring the store shape while components still depend on broad subscriptions
**What goes wrong:** A large Zustand store gets split or renamed, but client components still subscribe to wide object slices or assume old field names. The app "works" in shallow flows while realtime updates, overlays, possession, and room UI drift out of sync.
**Why it happens:** The current `useTmaStore` is broad and cross-feature. Refactors often move state first and only later tighten selectors, which leaves transitional code reading stale or over-broad state.
**Consequences:** Hidden behavioral regressions, extra rerenders, broken derived UI, and hard-to-debug race conditions between store hydration and realtime listeners.
**Prevention:** Split by domain behind a stable facade first. Introduce typed selectors before moving state. Move one slice at a time and keep old action signatures as compatibility wrappers until all consumers are migrated. Audit every `useTmaStore(...)` callsite before changing store shape.
**Detection:** Components start rerendering on unrelated state changes, room/poll overlays stop updating, or local fixes require reading from both old and new store locations.
**Confidence:** HIGH

### Pitfall 2: Breaking Supabase auth/session refresh by moving client helpers across server and browser boundaries
**What goes wrong:** Refactors collapse `client.ts`, `server.ts`, and `middleware.ts` into a shared helper or import the wrong helper from the wrong runtime. Auth looks fine locally until middleware refresh, redirects, or cookie writes fail in production.
**Why it happens:** Supabase's Next.js SSR guidance is explicit: browser code, server code, and middleware/proxy session refresh have different responsibilities. In live refactors, "deduplication" often erases those boundaries.
**Consequences:** Login loops, phantom anonymous sessions, cookies not updating, server components reading stale auth, and Vercel-only failures.
**Prevention:** Keep three explicit boundaries: browser client, server client, and middleware session updater. Allow shared config only for non-runtime-specific constants. Ban imports from `lib/supabase/server` inside client components and from `lib/supabase/client` inside route handlers/server components.
**Detection:** Redirect loops on `/login` and `/dashboard`, user present in browser but `null` on server render, or cookies only updating after manual refresh.
**Confidence:** HIGH

### Pitfall 3: Moving `apps/tma-client` without updating every root-sensitive contract
**What goes wrong:** The app directory is flattened or relocated, but TypeScript path aliases, Next config discovery, `.env.local`, build root, and deployment settings still point at the old location.
**Why it happens:** `apps/tma-client` is not just a folder; it is the effective app root for `tsconfig.json`, `next.config.ts`, package scripts, `.env.local`, and Vercel's project settings. File moves often update imports but miss root-scoped configuration.
**Consequences:** Broken `@/*` resolution, missing env vars at build/runtime, images failing due to skipped config, wrong project root on Vercel, and CI builds succeeding from one directory while production builds from another.
**Prevention:** Treat the move as a root migration checklist, not a rename. Update `package.json` scripts, `tsconfig.json` paths, Vercel Root Directory/build settings, env file location, editor configs, and any external automation referencing `apps/tma-client`. Test `next build` from the exact intended deployment root.
**Detection:** `Cannot resolve '@/...'` errors, env vars undefined only on Vercel, `next.config.ts` seemingly ignored, or builds unexpectedly using the repo root instead of the app root.
**Confidence:** HIGH

### Pitfall 4: Changing route structure and accidentally changing layout, middleware, or URL semantics
**What goes wrong:** Files are reorganized into route groups or feature folders and the team assumes this is a no-op. In reality, multiple root layouts, duplicate resolved paths, or moved `layout.tsx` boundaries change rendering and navigation behavior.
**Why it happens:** In the App Router, folder shape is architecture. Route groups remove folders from URLs, but layouts still apply by directory boundary. Moves that look organizational can change full-page reload behavior or route ownership.
**Consequences:** Layout remounts, lost client state across navigation, duplicate route conflicts, broken auth assumptions, and route-specific UI unexpectedly appearing or disappearing.
**Prevention:** Keep a route map before moving anything. Separate "URL-preserving route group moves" from "layout boundary changes" in different PRs. Snapshot current route tree and test each protected/public path after the move.
**Detection:** Full page reloads between sections that were previously client transitions, missing shared UI, route conflicts, or middleware/auth behavior changing for only some paths.
**Confidence:** HIGH

### Pitfall 5: Refactoring server/client component boundaries and accidentally inflating client bundles
**What goes wrong:** Shared utilities or data loaders get imported into client components, causing large server-safe modules to become client-bundled, or large client components stay monolithic and continue to own data fetching plus rendering.
**Why it happens:** Current files already mix orchestration, realtime, and UI concerns. During cleanup, people often move code into "shared" modules without marking whether it is browser-only, server-only, or pure.
**Consequences:** Worse performance, hydration edge cases, accidental secret exposure attempts, and harder future splitting.
**Prevention:** Tag refactor targets by runtime first: pure, browser, server, middleware. Extract pure domain logic separately from React/runtime wrappers. Use server components for initial fetch and keep client components focused on interactivity/realtime.
**Detection:** Client bundle growth after a "cleanup" PR, browser errors from server-only imports, or files needing `'use client'` solely because they import one client-only helper.
**Confidence:** MEDIUM-HIGH

## Moderate Pitfalls

### Pitfall 1: Import churn creates hidden circular dependencies
**What goes wrong:** Feature modules start importing store types/actions while the store keeps importing feature-domain types, producing cycles or initialization-order fragility.
**Prevention:** Make the store depend only on stable domain types, not feature UI modules. Move shared types into leaf modules. Avoid importing React components or component-owned types into the store.
**Detection:** Intermittent `undefined` exports, type-only imports turning runtime imports, or modules that only work after hot reload.
**Confidence:** MEDIUM

### Pitfall 2: Environment handling drifts across local, preview, and production
**What goes wrong:** Refactors rename variables, move env files, or assume repo-root loading rules that do not match the deployed app root. `NEXT_PUBLIC_*` usage also gets mixed with server-only expectations.
**Prevention:** Keep a single env contract document for the app root. Validate required vars at startup. Reserve `NEXT_PUBLIC_*` for browser-safe values only, and remember those values are inlined at build time.
**Detection:** Preview deploys fail while local dev works, browser code sees stale values after deploy, or secrets appear to be "missing" only in client code.
**Confidence:** HIGH

### Pitfall 3: Vercel project settings lag behind repository cleanup
**What goes wrong:** The repo is reorganized, but Vercel still builds the old directory, uses the wrong Node/build settings, or treats the monorepo root incorrectly.
**Prevention:** After any `apps/tma-client` move, explicitly review Vercel Project Settings for Root Directory, framework detection, install/build commands, and environment variables. Keep cloned/reference repos out of the deployed project scope.
**Detection:** Deployment logs reference old paths, preview builds do not match local `next build`, or Vercel detects the wrong framework root.
**Confidence:** HIGH

### Pitfall 4: Realtime listener migration causes duplicate subscriptions and memory leaks
**What goes wrong:** Refactors move listeners out of large client components, but old listeners remain mounted or cleanup behavior changes. Events begin firing twice or keep updating abandoned state.
**Prevention:** Inventory every Supabase channel subscription before extraction. Give each listener a single ownership point and verify cleanup paths with route transitions and unmounts.
**Detection:** Duplicated chat/poll events, repeated network subscriptions after navigation, or warnings about updates after unmount.
**Confidence:** MEDIUM-HIGH

### Pitfall 5: Database cleanup gets ahead of application compatibility
**What goes wrong:** Schema normalization, RLS changes, or type regeneration lands before all app queries are updated, especially in feature `api.ts` files and realtime payload assumptions.
**Prevention:** Ship DB changes as additive first. Keep compatibility columns/views/functions until the application migration is complete. Regenerate and diff database types as part of the refactor workflow.
**Detection:** Type drift between generated DB types and runtime payloads, queries returning `null`/empty arrays unexpectedly, or realtime handlers failing on missing fields.
**Confidence:** MEDIUM

## Minor Pitfalls

### Pitfall 1: Shared utility deduplication silently changes behavior
**What goes wrong:** Duplicate helpers such as image upload/crop or utility functions are merged, but one copy had app-specific assumptions that the other did not.
**Prevention:** Compare callsites before deduping. Add small behavior checks around bucket names, path generation, and UI expectations.
**Detection:** Uploads succeed in one feature but fail in another, or same utility behaves differently after move.
**Confidence:** MEDIUM

### Pitfall 2: Scratch/reference directories bleed into tooling
**What goes wrong:** Cloned or reference repos remain in the workspace and start affecting search, TypeScript project discovery, lint scope, or deployment assumptions.
**Prevention:** Keep explicit workspace/tooling scope. Prefer app-local scripts and project-specific globbing. Ensure `.gitignore`, Vercel root, and search/test commands target the intended app only.
**Detection:** `rg`, lint, or editor results suddenly include unrelated apps; deploy/build tools pick up the wrong package manifest.
**Confidence:** MEDIUM

### Pitfall 3: Cleanup PRs become too large to validate safely
**What goes wrong:** Repository moves, store splitting, route changes, Supabase boundary cleanup, and DB edits land together, making regressions impossible to isolate.
**Prevention:** Sequence by blast radius: observability/test harness first, then root move, then route/layout cleanup, then store slicing, then DB/performance work.
**Detection:** Reviewers cannot explain whether a failure came from pathing, runtime boundary, or behavior changes.
**Confidence:** HIGH

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Move or flatten `apps/tma-client` | Missing app-root config updates (`tsconfig`, `next.config`, `.env.local`, Vercel Root Directory) | Use a root-migration checklist and verify local + preview builds from the new root |
| Route cleanup | Route groups or layout moves change URL/layout semantics | Separate URL-preserving moves from layout changes and test every protected route |
| Zustand refactor | Slice split without selectors causes regressions and rerenders | Add selectors first, migrate one slice at a time, keep compatibility actions temporarily |
| Supabase cleanup | Browser/server/middleware clients get unified incorrectly | Preserve explicit runtime-specific entrypoints and enforce import boundaries |
| Performance work | Large components are split cosmetically but data/realtime still lives in the client shell | Move initial fetch server-side first, then isolate interactive islands |
| Database improvements | Schema/RLS changes outpace app compatibility | Favor additive migrations, regenerate types, and dual-run compatibility paths briefly |
| Vercel deployment | Project still points at old directory or wrong env scope | Reconfirm Root Directory, build commands, env vars, and preview behavior immediately after repo moves |
| Cloned/reference repos | Extra repos influence search, lint, or accidental commit scope | Keep tooling globs narrow and do not widen workspace scripts to repo root without intent |

## Early Warning Checklist

- `next build` only works from one directory but not the intended deployment root.
- `@/*` imports start failing after file moves.
- `/login` or `/dashboard` begins redirect-looping after Supabase cleanup.
- Client components import server-only helpers or need `'use client'` unexpectedly.
- Navigation between refactored sections triggers full reloads or loses shared state.
- Realtime events start firing twice after listener extraction.
- Preview deployments behave differently from local dev with the same branch.
- Generated database types no longer match query assumptions in feature `api.ts` files.
- Search/lint/build output starts including cloned/reference repos unintentionally.

## Sources

- Next.js Route Groups docs, last updated March 16, 2026: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js Environment Variables docs, last updated March 16, 2026: https://nextjs.org/docs/pages/guides/environment-variables
- Supabase Next.js server-side auth guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Next.js integration guide: https://supabase.com/docs/guides/with-nextjs
- Vercel Project Settings docs, last updated January 21, 2026: https://vercel.com/docs/project-configuration/project-settings
- Vercel Monorepos docs, last updated January 21, 2026: https://vercel.com/docs/monorepos
- Zustand Slices Pattern docs: https://zustand.docs.pmnd.rs/learn/guides/slices-pattern
- Zustand Flux-inspired practice docs: https://zustand.docs.pmnd.rs/learn/guides/flux-inspired-practice
- Zustand `useShallow` docs: https://zustand.docs.pmnd.rs/reference/hooks/use-shallow
