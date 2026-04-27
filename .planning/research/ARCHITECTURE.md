# Architecture Patterns

**Domain:** Next.js social investigation game / single active app refactor
**Project:** TMC - The Research for Hope
**Milestone:** v2.1 Repository & Architecture Improvements
**Researched:** 2026-04-26
**Confidence:** HIGH for Next.js structure, MEDIUM-HIGH for migration fit to this codebase

## Recommended Architecture

Keep a **single Next.js App Router app** and move toward a **feature-first, screaming architecture** where route files stay thin and business behavior lives in domain modules. Do not split into multiple apps, packages, or micro-frontends for this milestone. The current system is too coupled to the live game loop, global overlays, and shared Zustand state for that to be a safe first move.

The target shape should be:

1. `app` owns routing, layouts, route-level data loading, and route composition only.
2. `modules` owns domain behavior: characters, dashboard, exploration, investigation, admin, ai, vn.
3. `shared` owns generic UI, shared hooks, design utilities, and pure helpers.
4. `infra` owns Supabase clients, repository adapters, realtime wiring helpers, and external integrations.
5. `state` owns app-shell and feature-scoped Zustand stores/selectors.

This preserves what is already working in the codebase:

- Server-side page loading through App Router pages.
- Client-side hydration via `GlobalTmaRegistry`.
- Realtime subscriptions and immersive UI overlays.

It fixes what is currently expensive:

- Direct Supabase calls inside render-heavy components.
- A single global store acting as both app shell and game domain state.
- Types, queries, UI, and orchestration mixed in the same files.
- Duplication across `components/ui`, `features/shared`, and `utils`.

## Recommended Directory Shape

```text
apps/tma-client/src/
  app/
    (public)/
      login/
        page.tsx
    (game)/
      dashboard/
        page.tsx
      map/
        page.tsx
      rooms/
        [roomId]/
          page.tsx
    api/
      ai/
        case-builder/route.ts
        clue-generator/route.ts
    layout.tsx
    globals.css

  modules/
    app-shell/
      components/
        GlobalTmaRegistry.tsx
        TmaStoreInitializer.tsx
      hooks/
      services/
      store/
    characters/
      components/
      domain/
        types.ts
      repositories/
        characters.client.ts
        characters.server.ts
      services/
        character-session.ts
    dashboard/
      components/
      services/
      store/
    exploration/
      components/
      domain/
      repositories/
      services/
      store/
    investigation/
      components/
      domain/
      repositories/
      services/
      store/
    admin/
      components/
      repositories/
      services/
    ai/
      services/
    vn/
      components/
      services/
      store/

  shared/
    components/
      image/
      feedback/
      layout/
    hooks/
    lib/
    utils/
    types/

  infra/
    supabase/
      client.ts
      server.ts
      middleware.ts
    realtime/
    config/

  state/
    app-store/
      store.ts
      selectors.ts
    create-store.ts
```

## How To Reorganize A Single Active Next.js App Cleanly

Use **route groups** and **private implementation folders** inside `app`, but keep nearly all non-route code outside `app`. Next.js App Router explicitly supports both colocation and route grouping without changing URLs, and pages/layouts remain Server Components by default. That matches this codebase well because the game already benefits from server-loaded initial state and client-only realtime layers.

Recommended rules:

### 1. `app` is a composition layer, not a feature layer

Each `page.tsx` should do only this:

- authenticate / redirect
- load initial server data
- render a module entry component

Example:

```tsx
import { DashboardScreen } from "@/modules/dashboard/components/DashboardScreen";
import { getDashboardBootstrap } from "@/modules/dashboard/services/get-dashboard-bootstrap";

export default async function DashboardPage() {
  const bootstrap = await getDashboardBootstrap();
  return <DashboardScreen bootstrap={bootstrap} />;
}
```

### 2. Use route groups to separate experiences, not domains

Recommended:

- `app/(public)` for login/enrollment
- `app/(game)` for dashboard/map/rooms
- `app/api` for HTTP endpoints only

Do not create route groups for every feature. Domain grouping belongs in `modules`, not in `app`.

### 3. Keep client boundaries narrow

Current pages are already server-first. Keep that. Move `"use client"` deeper so only interactive screens, overlays, and realtime listeners become client bundles.

### 4. Use entry components per route

Each route should render exactly one screen-level component from a module:

- `DashboardPage` -> `modules/dashboard/components/DashboardScreen`
- `MapPage` -> `modules/exploration/components/MapScreen`
- `RoomPage` -> `modules/exploration/components/RoomScreen`

This gives you one obvious handoff point for tests, data contracts, and future refactors.

## Suggested Module Boundaries And Layering

The codebase should use a consistent dependency rule:

```text
app -> modules -> shared + infra + state
shared -> shared only
infra -> infra only
state -> shared only
```

Important constraint:

- A module may depend on `shared`, `infra`, and `state`.
- A module should not reach into another module's internals except through that module's exported service or component entrypoints.

### 1. Feature / domain modules

These should map to game capabilities, not visual areas:

- `characters`: identity, profile, session bootstrap, role info, possession context
- `dashboard`: dashboard composition, HUD, Nervalis entry points
- `exploration`: map, room presence, room transitions, stealth, privacy rooms
- `investigation`: evidence, evidence polls, logs, clue reveal flow
- `admin`: admin tools, room editor, NPC creation, override flows
- `vn`: dialog, whispers, group chat, room conversation UI
- `app-shell`: global initialization, overlays, cross-route listeners
- `ai`: AI orchestration and server-side case-builder support

Rule: a module owns its types, repository contracts, and orchestration services.

### 2. Shared UI

Move only generic, reusable primitives into `shared/components`.

Should live in `shared`:

- image upload/crop widgets
- generic modal shell
- loading states
- reusable visual indicators
- pure dice utilities if not tied to exploration semantics

Should stay in modules:

- `NervalisOverlay`
- `GlobalPollOverlay`
- `StaffIdentitySwitcher`
- `InsideRoomArena`
- `VNDialogBox`

These are product-specific, not shared UI.

### 3. Infrastructure

`infra` should own external system details:

- Supabase client/server creation
- channel naming helpers
- query builders
- storage bucket helpers
- external AI provider adapters

No React components in `infra`.

### 4. Data access

Current `features/*/api.ts` files mix domain types and direct Supabase queries. Split that into:

- `domain/types.ts`
- `repositories/*.client.ts`
- `repositories/*.server.ts`
- `services/*.ts`

Pattern:

```text
repository = raw data access
service = game rule / orchestration
component = render + user interaction
```

For example:

```text
modules/investigation/
  domain/types.ts
  repositories/evidence.client.ts
  repositories/evidence.server.ts
  services/evidence-polls.ts
  components/EvidenceTab.tsx
```

### 5. State

`useTmaStore` should be split by responsibility. Keep Zustand, but stop treating one store as the whole system.

Recommended slices:

- `appSessionSlice`: user role, original character, possession, initialization
- `gameMetaSlice`: game period, motive, poll flags
- `explorationUiSlice`: selected room, privacy poll, stealth flags
- `vnSlice`: dialog state, whispers, group messages, active clue
- `nervalisUiSlice`: terminal open state, unread signals, window position

Two acceptable end states:

1. One store composed from slices.
2. Two to four focused stores by concern.

For this milestone, prefer **one composed store with slices**. It minimizes breakage while still removing the god-object file.

## Recommended Runtime Layering

Use this split consistently:

### Server components

Use for:

- auth checks
- initial bootstrap queries
- route redirects
- non-interactive screen composition

### Client components

Use for:

- realtime subscriptions
- local interaction
- animations
- WebGL / room rendering
- browser APIs like `localStorage`

### Services

Use for:

- orchestration that combines repository calls
- translating Supabase rows into UI/domain models
- permission checks reused by multiple screens

### Repositories

Use for:

- direct `.from(...).select(...)`
- direct inserts/updates
- channel subscription setup wrappers

This is the key integration rule for this app:

**components should not contain raw Supabase table knowledge unless they are temporary migration wrappers.**

## Current Codebase-Specific Refactor Targets

These are the highest-value moves for this repository:

### 1. Move global runtime components into an `app-shell` module

Current:

- `src/components/GlobalTmaRegistry.tsx`
- `src/components/TmaStoreInitializer.tsx`
- `src/components/GlobalCharacterListener.tsx`
- `src/components/GlobalNotificationListener.tsx`

Target:

- `src/modules/app-shell/components/*`

Reason: these are not generic components; they are the runtime shell of the game.

### 2. Collapse duplicated shared assets

Current duplication:

- `components/ui/ImageUploader.tsx`
- `features/shared/components/ImageUploader.tsx`
- `components/ui/ImageCropperModal.tsx`
- `features/shared/components/ImageCropperModal.tsx`
- `utils/cropImage.ts`
- `features/shared/utils/cropImage.ts`

Target:

- one canonical location under `shared/components/image/*`
- one canonical crop utility under `shared/utils/*`

### 3. Move data access out of screen components

Priority components:

- `AcademyMap.tsx`
- `InsideRoomArena.tsx`
- `VNDialogBox.tsx`
- `GlobalPollOverlay.tsx`
- `AdminDashboardView.tsx`
- `RoomPageClient.tsx`

These should consume services/hooks, not write raw Supabase queries inline.

### 4. Split `characters/api.ts`

It currently acts as:

- type definition file
- current user session access
- game-state access
- admin listing API
- mutation layer

That is too much coupling for the rest of the refactor to stay clean.

## Incremental Migration Strategy

Do not rename the whole tree at once. Use a **strangler pattern** with compatibility exports.

### Phase A: Stabilize architecture seams first

Do first:

- create `modules`, `shared`, `infra`, `state`
- add barrel exports only where useful
- move files without changing behavior
- keep old import paths working temporarily through re-export shims

Example shim:

```ts
export { GlobalTmaRegistry } from "@/modules/app-shell/components/GlobalTmaRegistry";
```

This lets route files and active game screens continue working while imports are migrated gradually.

### Phase B: Extract repositories before touching UI composition

Before changing component structure, extract direct Supabase calls into repositories and services. This creates a testable seam and lowers the risk of logic regressions.

Do not start with visual component decomposition. The dangerous part of this app is data/realtime behavior, not JSX size.

### Phase C: Slice the Zustand store after repository extraction

Once data access is less coupled, split `useTmaStore` into slices while preserving the same public selectors/actions where possible.

This reduces churn because components can keep calling similar selectors during the migration.

### Phase D: Introduce screen entry components

After data and store seams exist, replace direct route-page composition with module screen components.

This is where `DashboardPage`, `MapPage`, and `rooms/[roomId]/page.tsx` become thin and stable.

### Phase E: Tighten boundaries and remove shims

Only after all modules are migrated:

- remove old `features/shared` duplicates
- remove `components/ui` duplicates
- remove leftover root-level `components` that are actually module-specific
- remove temporary re-export shims

## Suggested Build Order For Refactor Phases

This is the safest order for this codebase:

### 1. Foundation: folders, aliases, and migration rules

Deliverables:

- create `modules`, `shared`, `infra`, `state`
- document import rules
- add temporary re-export shims
- choose canonical homes for duplicated shared files

Reason: no behavior change, but all later work gets a target.

### 2. Shared + infra consolidation

Deliverables:

- consolidate image uploader/cropper and crop utils
- standardize Supabase client imports under `infra/supabase`
- move non-domain generic utilities into `shared`

Reason: easiest wins, reduces duplicate dependencies before domain work.

### 3. Character/session and app-shell extraction

Deliverables:

- move global registry/listeners into `modules/app-shell`
- split `characters/api.ts` into domain types + repositories + services
- preserve existing bootstrap flow from server page -> registry -> store

Reason: this is the central spine every route depends on.

### 4. Store decomposition

Deliverables:

- break `useTmaStore` into slices or focused sub-stores
- keep existing action names where possible
- add selectors so components stop reaching into full store state

Reason: after this, module boundaries become much easier to enforce.

### 5. Exploration module refactor

Deliverables:

- extract room/map repositories and services
- thin `AcademyMap`, `InsideRoomArena`, `RoomNavigation`, `RoomPageClient`
- isolate realtime subscriptions behind hooks/services

Reason: exploration is the most coupled runtime area and the highest architectural risk.

### 6. Investigation + VN refactor

Deliverables:

- move evidence/log/chat data access into repositories
- keep components focused on rendering and event handlers
- align poll and message subscriptions with the same service pattern used in exploration

Reason: these systems are tightly connected to exploration and Nervalis, but can be normalized after the room layer is stable.

### 7. Dashboard and admin composition cleanup

Deliverables:

- convert dashboard/admin screens to module entry components
- remove module-crossing imports into internals
- make `app/dashboard/page.tsx` a thin composition shell

Reason: lower risk after shared state and data access seams are established.

### 8. Final boundary enforcement

Deliverables:

- delete old paths
- remove shims
- add lint rules or conventions for forbidden imports
- document module ownership

Reason: only worth enforcing once the migration is complete.

## Anti-Patterns To Avoid

### Anti-Pattern 1: Big-bang move from `features` to `modules`

**What:** Renaming everything and fixing imports in one pass.
**Why bad:** High merge risk, high runtime regression risk, impossible to isolate blame when game logic breaks.
**Instead:** Move by domain spine and keep re-export shims temporarily.

### Anti-Pattern 2: Putting all code under `app`

**What:** Using route colocation as the main organization strategy.
**Why bad:** Hides domain boundaries, encourages route-coupled code, and makes reuse across dashboard/map/rooms harder.
**Instead:** Keep `app` thin and put domain code in `modules`.

### Anti-Pattern 3: Turning `shared` into a dumping ground

**What:** Moving product-specific components into shared just because multiple modules import them.
**Why bad:** Shared becomes another god-folder with no ownership.
**Instead:** Only move generic primitives into `shared`; keep game-specific UI inside the owning module.

### Anti-Pattern 4: Refactoring store shape and business logic simultaneously

**What:** Changing state structure while also rewriting game rules.
**Why bad:** Too many moving parts to debug in a realtime game.
**Instead:** Preserve behavior first, then reshape state behind compatible actions/selectors.

### Anti-Pattern 5: Replacing Zustand during the architecture refactor

**What:** Migrating to another state solution as part of this milestone.
**Why bad:** No user-facing payoff and very high regression surface.
**Instead:** Keep Zustand and improve store boundaries.

## Scalability Considerations

| Concern | Current Scale | v2.1 Refactor Approach | Later Scale |
|---------|---------------|------------------------|-------------|
| Realtime subscriptions | Works but is embedded in UI | Move channel wiring into hooks/services | Enables throttling, fan-out control, and testability |
| Game state ownership | One global store | Slice by concern | Enables selective subscriptions and easier debugging |
| Supabase schema coupling | High | Repositories encapsulate table knowledge | Safer schema changes and RPC adoption later |
| Route complexity | Manageable | Thin route composition layer | Easier addition of new game screens |
| Shared code reuse | Duplicated | Canonical `shared` primitives | Lower maintenance cost |

## Final Recommendation

For this milestone, the right architecture is:

- **single-app App Router**
- **feature-first modules outside `app`**
- **thin route composition**
- **repositories/services around Supabase**
- **Zustand slices instead of one monolithic store**
- **incremental strangler migration with shims**

That gets the codebase closer to screaming architecture without risking the live game logic through a full rewrite.

## Sources

- Next.js App Router project structure and organization: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js App Router colocation, route groups, and private folders: https://nextjs.org/docs/app/building-your-application/routing/colocation
- Next.js Server and Client Components guidance: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Local codebase inspection:
  - `apps/tma-client/src/app`
  - `apps/tma-client/src/features`
  - `apps/tma-client/src/components`
  - `apps/tma-client/src/store/useTmaStore.ts`
  - `apps/tma-client/package.json`
