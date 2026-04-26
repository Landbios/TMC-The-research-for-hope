<!-- refreshed: 2026-04-26 -->
# Architecture

**Analysis Date:** 2026-04-26

## System Overview

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                              Next.js App Layer                            │
├──────────────────────┬──────────────────────────┬──────────────────────────┤
│  TMA Client          │  Character Vault         │  S.C.I.O.N              │
│  `apps/tma-client`   │  `tmc-characters-maker`  │  `tmc-scion`            │
└───────────┬──────────┴──────────────┬───────────┴──────────────┬───────────┘
            │                         │                          │
            ▼                         ▼                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                   Feature / State / Supabase Access Layer                 │
│ `apps/tma-client/src/features`, `apps/tma-client/src/store`,             │
│ `apps/tma-client/src/lib/supabase`, `tmc-characters-maker/store`,        │
│ `tmc-characters-maker/utils/supabase`, `tmc-scion/store`,                │
│ `tmc-scion/lib/supabase`                                                 │
└────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                      Supabase + Browser/Server APIs                       │
│ `apps/tma-client/src/app/api`, `tmc-characters-maker/app/api`,           │
│ `tmc-characters-maker/app/auth/callback/route.ts`,                       │
│ `tmc-scion/app/auth/callback/route.ts`                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root workspace | Declares the npm workspace boundary and only wires `tma-client` scripts | `package.json` |
| TMA client app router | Hosts the current primary gameplay routes, overlays, realtime listeners, and AI endpoints | `apps/tma-client/src/app` |
| TMA feature modules | Group gameplay logic by domain such as `admin`, `characters`, `dashboard`, `exploration`, `investigation`, `vn-ui` | `apps/tma-client/src/features` |
| TMA global state | Holds shared client session/gameplay state and UI coordination | `apps/tma-client/src/store/useTmaStore.ts` |
| TMA Supabase adapters | Separate browser, server, and middleware client creation | `apps/tma-client/src/lib/supabase` |
| Character Vault app | Runs as a standalone Next.js app for authoring and browsing character data | `tmc-characters-maker/app` |
| Character Vault editor state | Stores the in-progress character sheet document | `tmc-characters-maker/store/character-store.ts` |
| S.C.I.O.N app | Runs as a standalone Next.js app for chatroom-style roleplay operations | `tmc-scion/app` |
| S.C.I.O.N stores | Split auth, chatrooms, messages, and character/session state into separate Zustand stores | `tmc-scion/store` |

## Pattern Overview

**Overall:** Multi-app Next.js monorepo with Supabase-backed feature slices and client-side Zustand state.

**Key Characteristics:**
- Use App Router pages in `app/` or `src/app/` as the only route entry points.
- Put most business logic in feature-local API helpers and state stores instead of a shared service layer.
- Bridge server-rendered pages and client interactivity by fetching authenticated data on the server, then hydrating client registries and subscribing to realtime updates.

## Layers

**Workspace Layer:**
- Purpose: Defines the repo-level package boundary.
- Location: `package.json`, `apps/`, `packages/`
- Contains: npm workspaces and root scripts.
- Depends on: individual application manifests.
- Used by: local development and build commands.

**Route Layer:**
- Purpose: Owns URL structure, page composition, and route protection entry points.
- Location: `apps/tma-client/src/app`, `tmc-characters-maker/app`, `tmc-scion/app`
- Contains: `layout.tsx`, `page.tsx`, dynamic route folders, and `app/api/*/route.ts`.
- Depends on: feature modules, Supabase server helpers, client components.
- Used by: Next.js runtime.

**Feature Layer:**
- Purpose: Encapsulates gameplay or product domains.
- Location: `apps/tma-client/src/features`
- Contains: domain-specific `api.ts` files and UI components grouped by feature.
- Depends on: `@/lib/supabase/client`, `@/store/useTmaStore`, shared UI helpers.
- Used by: route components and global registries.

**State Layer:**
- Purpose: Coordinates cross-component client state.
- Location: `apps/tma-client/src/store`, `tmc-characters-maker/store`, `tmc-scion/store`
- Contains: Zustand stores for gameplay, editor state, auth, chatrooms, messages, and character membership.
- Depends on: domain types and Supabase browser clients.
- Used by: client components, overlays, and dashboard/chatroom shells.

**Infrastructure Layer:**
- Purpose: Centralizes Supabase client construction and request/session adaptation.
- Location: `apps/tma-client/src/lib/supabase`, `tmc-characters-maker/utils/supabase`, `tmc-scion/lib/supabase`
- Contains: `client.ts`, `server.ts`, and middleware session-refresh helpers.
- Depends on: `@supabase/ssr`, Next request/cookie APIs, environment variables.
- Used by: middleware, server components, route handlers, and browser-side data helpers.

## Data Flow

### Primary Request Path

1. Request enters Next middleware, which refreshes Supabase auth and redirects anonymous users away from protected pages (`apps/tma-client/src/middleware.ts:4`, `apps/tma-client/src/lib/supabase/middleware.ts:4`).
2. Server pages fetch the authenticated character, game state, and profile before rendering route-level UI (`apps/tma-client/src/app/dashboard/page.tsx:9`, `apps/tma-client/src/features/characters/server-api.ts:5`).
3. Client registries hydrate Zustand state and attach global realtime listeners/overlays for the rest of the session (`apps/tma-client/src/components/GlobalTmaRegistry.tsx:24`, `apps/tma-client/src/store/useTmaStore.ts:87`).

### Room Exploration Flow

1. Dynamic room entry loads the character/game snapshot on the server and passes it into a client shell (`apps/tma-client/src/app/rooms/[roomId]/page.tsx:5`).
2. `RoomPageClient` resolves room metadata in the browser and mounts `InsideRoomArena` with the global registry (`apps/tma-client/src/app/rooms/[roomId]/RoomPageClient.tsx:17`).
3. `InsideRoomArena` validates room access, loads evidence, subscribes to room/poll/character changes, and mutates the store plus local room state (`apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx:36`).

### Character Vault Editing Flow

1. The root page mounts the editor and preview side by side (`tmc-characters-maker/app/page.tsx:14`).
2. Form edits update the in-memory character document via Zustand (`tmc-characters-maker/store/character-store.ts:13`).
3. Save/export screens and API routes persist or expose records through Supabase-backed handlers (`tmc-characters-maker/components/CharacterEditor.tsx`, `tmc-characters-maker/app/api/characters/route.ts:12`).

### S.C.I.O.N Chatroom Flow

1. Middleware refreshes the session and blocks protected routes for unauthenticated users (`tmc-scion/middleware.ts:4`, `tmc-scion/lib/supabase/middleware.ts:4`).
2. The auth store initializes the current user/profile and exposes role-aware state to the dashboard (`tmc-scion/store/authStore.ts:45`, `tmc-scion/app/dashboard/page.tsx:10`).
3. Chatroom pages compose several stores in one large client entry component to manage membership, messages, sprites, and room controls (`tmc-scion/app/chatroom/[id]/page.tsx:149`).

**State Management:**
- `apps/tma-client` uses one broad global Zustand store in `apps/tma-client/src/store/useTmaStore.ts`.
- `tmc-characters-maker` uses a single editor-centric store in `tmc-characters-maker/store/character-store.ts`.
- `tmc-scion` uses multiple narrower stores in `tmc-scion/store/*.ts`.

## Key Abstractions

**Feature Slice:**
- Purpose: Keep domain UI and its Supabase calls together.
- Examples: `apps/tma-client/src/features/admin`, `apps/tma-client/src/features/exploration`, `apps/tma-client/src/features/investigation`
- Pattern: Each slice typically exposes `api.ts` plus `components/`.

**Global Registry:**
- Purpose: Mount one-time store initialization and cross-cutting listeners near the page root.
- Examples: `apps/tma-client/src/components/GlobalTmaRegistry.tsx`, `apps/tma-client/src/components/TmaStoreInitializer.tsx`
- Pattern: Server page passes canonical state into a client registry that fans out listeners and overlays.

**Supabase Client Split:**
- Purpose: Use the correct client variant for browser, server component, and middleware code paths.
- Examples: `apps/tma-client/src/lib/supabase/client.ts`, `apps/tma-client/src/lib/supabase/server.ts`, `apps/tma-client/src/lib/supabase/middleware.ts`
- Pattern: Keep auth/session concerns out of feature modules and call through a tiny adapter.

**Store-Driven Screen Shell:**
- Purpose: Let large interactive screens coordinate many child components without prop drilling.
- Examples: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`, `tmc-scion/app/chatroom/[id]/page.tsx`
- Pattern: A top-level client screen pulls state/actions from stores and delegates rendering to many embedded components.

## Entry Points

**Workspace Startup:**
- Location: `package.json`
- Triggers: `npm run dev:client`, `npm run build:client`
- Responsibilities: Delegate root commands into the workspace-managed `tma-client` app.

**TMA Client Root Layout:**
- Location: `apps/tma-client/src/app/layout.tsx`
- Triggers: Every `apps/tma-client` route render.
- Responsibilities: Load fonts, global CSS, and the global toast container.

**TMA Client Middleware:**
- Location: `apps/tma-client/src/middleware.ts`
- Triggers: Every non-static request in `apps/tma-client`.
- Responsibilities: Route all requests through Supabase session refresh and auth redirects.

**Character Vault Root Layout:**
- Location: `tmc-characters-maker/app/layout.tsx`
- Triggers: Every `tmc-characters-maker` route render.
- Responsibilities: Mount the auth refresh wrapper, bottom navigation, service worker registration, and toast layer.

**S.C.I.O.N Root Layout:**
- Location: `tmc-scion/app/layout.tsx`
- Triggers: Every `tmc-scion` route render.
- Responsibilities: Mount the auth initializer and global toast container.

## Architectural Constraints

- **Threading:** All three apps follow the standard single-threaded Next.js/React event loop model; no worker-thread or queue layer is present.
- **Global state:** Module-level shared state is concentrated in Zustand stores such as `apps/tma-client/src/store/useTmaStore.ts`, `tmc-characters-maker/store/character-store.ts`, and `tmc-scion/store/*.ts`.
- **Circular imports:** No explicit circular-import guard layer exists; `apps/tma-client/src/store/useTmaStore.ts` imports types from feature modules and is also imported back into many of those features, so new dependencies should avoid deepening that two-way coupling.
- **Source root mismatch:** `apps/tma-client` resolves `@/*` to `./src/*`, while `tmc-characters-maker` and `tmc-scion` resolve `@/*` to repo-local root files. Keep imports app-local and do not assume aliases are portable across apps.
- **Mixed repo topology:** `tmc-characters-maker/.git` and `tmc-scion/.git` exist inside the main repo, so treat those directories as embedded projects even though they are mapped here.

## Anti-Patterns

### Cross-App Duplication

**What happens:** Supabase helpers, auth middleware, image uploaders, and utility helpers are reimplemented separately in `apps/tma-client`, `tmc-characters-maker`, and `tmc-scion`.
**Why it's wrong:** Behavior diverges across apps and there is no shared package in `packages/` to keep infrastructure consistent.
**Do this instead:** If new behavior must be shared, extract it into `packages/` first or keep it isolated within one app rather than copying files again.

### Oversized Client Entry Components

**What happens:** Large screens own data loading, subscriptions, UI state, and rendering in one file, especially `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx` and `tmc-scion/app/chatroom/[id]/page.tsx`.
**Why it's wrong:** Adding new behavior increases coordination risk and makes local reasoning harder.
**Do this instead:** Extend the surrounding feature directory with new child components or store actions, and keep route shells focused on orchestration.

## Error Handling

**Strategy:** Mostly inline error handling with redirects, empty-array/null fallbacks, thrown Supabase errors, and toast notifications in client components.

**Patterns:**
- Middleware redirects when auth is missing or when authenticated users hit login routes (`apps/tma-client/src/lib/supabase/middleware.ts:36`, `tmc-characters-maker/middleware.ts:32`).
- Data helpers frequently return `null` or `[]` instead of raising errors (`apps/tma-client/src/features/characters/server-api.ts:22`, `apps/tma-client/src/features/investigation/api.ts:36`).

## Cross-Cutting Concerns

**Logging:** Mostly `console.error`, `console.warn`, and `console.log` inside stores and route handlers such as `tmc-scion/store/authStore.ts:94` and `apps/tma-client/src/features/investigation/api.ts:130`.
**Validation:** Minimal centralized validation; most inputs are checked inline inside route handlers or form submit functions such as `tmc-characters-maker/app/api/characters/route.ts:13`.
**Authentication:** Supabase session middleware plus per-page/profile checks are the primary auth mechanism across all three apps.

---

*Architecture analysis: 2026-04-26*
