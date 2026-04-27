# Technology Stack

**Project:** v2.1 Repository & Architecture Improvements
**Researched:** 2026-04-26

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js App Router in `apps/tma-client` | Current repo version (`next@16.2.1`) | Main deployable application | Keep the existing app location. Vercel supports monorepos by setting a project Root Directory, so moving the app to repo root does not buy deployment simplicity but does create path churn and refactor risk. |
| React + TypeScript | Current repo versions | UI and app logic | Already in place and aligned with the current app. This milestone should tighten boundaries around existing code, not swap frameworks. |
| npm workspaces | Current root workspace config | Lightweight monorepo shell | The repo already has a valid root `workspaces` setup for `apps/*` and `packages/*`. For one active app, this is enough; adding Turborepo or Nx now would add ceremony before there is a real multi-app or multi-package workload. |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase client usage as-is, with migration discipline improvements | Current repo packages | Data access and auth/session integration | The milestone goal is low-risk database improvement. Keep Supabase, but move toward one canonical migration path and app-local schema/type ownership instead of scattered root SQL snapshots driving ad hoc updates. |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel project targeting `apps/tma-client` as Root Directory | Current Vercel monorepo support | Deployment shape | This keeps the repo Vercel-ready without restructuring the workspace. It also preserves room for future apps/packages if they become real first-class workspaces later. |
| Root npm scripts delegating to the active workspace | Current npm CLI behavior | Local DX and CI entrypoints | Keep the repo root as the orchestration point, but make scripts explicit for `dev`, `build`, `lint`, and type-check against `tma-client`. That gives Vercel/CI clarity without changing runtime behavior. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `typescript` | Current repo version | Type boundaries across app modules | Use stricter typing to separate route-layer code, feature modules, and infrastructure helpers before extracting any shared package. |
| `eslint` + `eslint-config-next` | Current repo version | Enforce boundary hygiene | Add rules or conventions that prevent route files from becoming dumping grounds and discourage cross-feature deep imports. |
| `@supabase/ssr` + `@supabase/supabase-js` | Current repo versions | Server/client Supabase integration | Keep these inside app-local infrastructure modules such as `src/lib/supabase/*`; do not spread client construction logic across feature folders. |

## Repo Topology Recommendation

Recommended milestone topology:

```text
[repo-root]
|- apps/
|  `- tma-client/              # only deployable app
|     |- src/app/              # routes only
|     |- src/features/         # domain modules
|     |- src/lib/              # infra/framework adapters
|     |- src/components/       # app-shell/shared composition only
|     |- src/store/            # global state, reduced to true cross-feature concerns
|     |- src/server/           # optional: server-only queries/actions if introduced
|     `- public/
|- packages/                   # keep available, do not force usage yet
|- tmc-scion/                  # ignored reference repo
|- tmc-characters-maker/       # ignored reference repo
|- package.json                # root workspace manifest
`- package-lock.json
```

Practical adjustments for this milestone:

1. Keep the monorepo root, but treat it as an orchestration shell, not an application.
2. Keep `apps/tma-client` as the only first-class app and deployment unit.
3. Keep `tmc-scion` and `tmc-characters-maker` ignored and clearly documented as workspace-adjacent references, not workspaces.
4. Keep `packages/` available for future extraction, but do not extract code into it until at least one of these is true:
   - a module has multiple consumers
   - a package boundary improves deploy/test independence
   - the extracted code can be versioned and owned separately
5. Move toward a stricter internal app layout:
   - `src/app`: routing, layouts, route handlers only
   - `src/features/*`: feature-local UI, hooks, queries, state
   - `src/lib/*`: Supabase clients, low-level utilities, framework adapters
   - `src/components/*`: app-shell or genuinely shared UI only

## Should `apps/tma-client` Flatten Into a Single App Structure?

Recommendation: **No repo-root flattening in this milestone.**

Keep `apps/tma-client` where it is, and instead flatten **inside the app** where useful.

Why:

- Vercel already supports deploying a subdirectory in a monorepo through the Root Directory setting.
- The current root contains planning artifacts, SQL snapshots, and two ignored reference repos. Promoting the active app to repo root would mix deployable app concerns with workspace storage concerns.
- Moving the app to root would force mostly mechanical changes: script rewiring, path/documentation updates, potential CI/Vercel setting drift, and more confusing root noise. That is churn, not architecture improvement.

Tradeoffs that matter:

| Option | Benefit | Cost | Recommendation |
|--------|---------|------|----------------|
| Keep `apps/tma-client` | Lowest risk, already workspace-compatible, Vercel-ready | Slightly more nesting in paths | Recommended |
| Move app to repo root | Marginally shorter paths and simpler mental model if the repo will never host another app/package | High churn, weak benefit, mixes app with ignored repos and root artifacts | Do not do this now |

The flattening worth doing is internal:

- reduce duplicate shared code paths such as top-level `src/utils` vs `src/features/shared/utils`
- reduce duplicate generic UI locations such as `src/components/ui` vs `src/features/shared/components` when ownership is unclear
- make route files thin and move business logic into feature/server modules

## Workspace and Vercel Readiness

Recommended deployment stance:

1. Keep the root `package.json` as the workspace manifest.
2. Set the Vercel project Root Directory to `apps/tma-client`.
3. Add root scripts that mirror the active app lifecycle clearly:

```bash
npm run dev --workspace=tma-client
npm run build --workspace=tma-client
npm run lint --workspace=tma-client
npm run typecheck --workspace=tma-client
```

4. Add a `typecheck` script to `apps/tma-client/package.json` if missing.
5. Consider adding a `packageManager` field at repo root to make the intended npm toolchain explicit for local setup and Vercel detection.

Implications:

- This is enough for a clean single-app-on-Vercel setup.
- It preserves a safe path for future `packages/*` extraction without another repo reshape.
- It keeps ignored side repos outside the workspace graph, which is what you want.

## Tooling and Structural Changes Worth Considering

| Change | Why | Scope |
|--------|-----|-------|
| Add root `lint` and `typecheck` scripts | Makes the root a reliable CI/Vercel operator entrypoint | Low |
| Add app-level boundary conventions | Prevents `src/app` and `src/components` from absorbing feature logic | Low |
| Introduce `src/server/` or feature-local `server/` folders | Separates server-only queries/actions from client components | Low to medium |
| Consolidate SQL/migration ownership | Reduces risk of schema drift from many root snapshots | Medium |
| Add import-path conventions for features | Makes module ownership obvious and future extraction easier | Low |
| Remove or isolate committed scratch diagnostics | Keeps the app deployable surface cleaner | Low |

Recommended structural stance for database artifacts in this milestone:

- keep database changes conservative
- choose one canonical migration location/process
- stop letting root-level loose SQL files accumulate as the de facto system of record

## What Not to Introduce Yet

| Category | Do Not Introduce Yet | Why Not |
|----------|----------------------|---------|
| Monorepo tooling | Turborepo, Nx, Rush | One active app does not justify the operational overhead yet. npm workspaces already cover the current need. |
| Package extraction | Shared UI/core/data packages | The repo does not yet have proven multi-consumer modules. Premature extraction would create dependency and versioning overhead without payoff. |
| Service splits | Separate API app, worker app, or BFF package | This milestone is about simplification and low-risk performance work, not distributed architecture. |
| Database platform churn | ORM swap or Supabase replacement | Too much behavioral risk for this milestone. Improve schema discipline first. |
| Broad repo flattening | Moving `apps/tma-client` to root | Mostly mechanical churn; does not materially improve Vercel readiness. |
| Heavy build/test infrastructure | Complex task runners or caching layers | Add only after repeated pain is visible in CI/build times, not speculatively. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| App location | Keep `apps/tma-client` | Move app to repo root | Vercel does not require the move; churn outweighs benefit. |
| Monorepo management | npm workspaces only | Turborepo/Nx | No demonstrated need yet; current repo has one active app and zero shared packages. |
| Shared code strategy | Tighten app-internal boundaries first | Immediate `packages/*` extraction | Extraction before multiple consumers creates artificial boundaries. |
| DB improvement path | Canonicalize migrations and types | Introduce new ORM/toolchain | Higher migration risk and unnecessary milestone scope growth. |

## Installation

```bash
# Root orchestration stays minimal
npm install

# Active app lifecycle from repo root
npm run dev --workspace=tma-client
npm run build --workspace=tma-client
npm run lint --workspace=tma-client
```

## Sources

- Current repo inspection on 2026-04-26:
  - root `package.json`
  - `apps/tma-client/package.json`
  - `.gitignore`
  - `.planning/codebase/STRUCTURE.md`
  - `apps/tma-client/tsconfig.json`
  - `apps/tma-client/next.config.ts`
- Vercel monorepo documentation: https://vercel.com/docs/monorepos
- Next.js `src` directory documentation: https://nextjs.org/docs/app/building-your-application/configuring/src-directory
- npm workspaces documentation: https://docs.npmjs.com/cli/v8/using-npm/workspaces/
