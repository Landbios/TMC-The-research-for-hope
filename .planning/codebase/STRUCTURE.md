# Codebase Structure

**Analysis Date:** 2026-04-26

## Directory Layout

```text
[project-root]/
├── apps/
│   └── tma-client/            # Workspace-managed main gameplay client
├── packages/                  # Reserved for shared packages; currently empty
├── tmc-characters-maker/      # Standalone Next.js character authoring app
├── tmc-scion/                 # Standalone Next.js roleplay/chatroom app
├── .planning/codebase/        # Generated architecture/quality/intel documents
├── package.json               # Root workspace manifest
├── package-lock.json          # Root lockfile
├── README.md                  # High-level repo description
└── *.sql                      # Database schema and migration snapshots
```

## Directory Purposes

**`apps/tma-client`:**
- Purpose: Main TMA gameplay application and the only app wired into root workspace scripts.
- Contains: `src/app` routes, `src/features` domain logic, `src/store` global state, `src/lib/supabase` adapters, top-level app config.
- Key files: `apps/tma-client/package.json`, `apps/tma-client/src/app/layout.tsx`, `apps/tma-client/src/middleware.ts`

**`apps/tma-client/src/app`:**
- Purpose: Route tree for the primary client.
- Contains: App Router layouts/pages and API routes under `api/`.
- Key files: `apps/tma-client/src/app/dashboard/page.tsx`, `apps/tma-client/src/app/map/page.tsx`, `apps/tma-client/src/app/rooms/[roomId]/page.tsx`

**`apps/tma-client/src/features`:**
- Purpose: Feature-first domain modules.
- Contains: `admin`, `ai`, `characters`, `dashboard`, `exploration`, `investigation`, `shared`, `vn-ui`.
- Key files: `apps/tma-client/src/features/characters/api.ts`, `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`

**`apps/tma-client/src/components`:**
- Purpose: App-level composition helpers that are not owned by one feature.
- Contains: global registries, listeners, and a small `ui/` set.
- Key files: `apps/tma-client/src/components/GlobalTmaRegistry.tsx`, `apps/tma-client/src/components/TmaStoreInitializer.tsx`

**`apps/tma-client/src/store`:**
- Purpose: Central gameplay/session state.
- Contains: one broad Zustand store.
- Key files: `apps/tma-client/src/store/useTmaStore.ts`

**`tmc-characters-maker`:**
- Purpose: Character creation, browsing, export, and related admin/API screens.
- Contains: root-level `app`, `components`, `store`, `types`, `utils`, `public`.
- Key files: `tmc-characters-maker/app/layout.tsx`, `tmc-characters-maker/app/page.tsx`, `tmc-characters-maker/store/character-store.ts`

**`tmc-scion`:**
- Purpose: Roleplay chatroom application with room management and realtime communication.
- Contains: root-level `app`, `components`, `store`, `lib`, `hooks`, `References`.
- Key files: `tmc-scion/app/layout.tsx`, `tmc-scion/app/dashboard/page.tsx`, `tmc-scion/store/authStore.ts`

**`packages`:**
- Purpose: Intended shared-package location from the root workspace declaration.
- Contains: Not detected.
- Key files: Not applicable

## Key File Locations

**Entry Points:**
- `package.json`: Root workspace manifest and top-level scripts.
- `apps/tma-client/src/app/layout.tsx`: Primary gameplay client root layout.
- `apps/tma-client/src/middleware.ts`: Primary gameplay auth/session gate.
- `tmc-characters-maker/app/layout.tsx`: Character Vault root layout.
- `tmc-scion/app/layout.tsx`: S.C.I.O.N root layout.

**Configuration:**
- `apps/tma-client/tsconfig.json`: `@/*` points to `./src/*`.
- `tmc-characters-maker/tsconfig.json`: `@/*` points to the app root.
- `tmc-scion/tsconfig.json`: `@/*` points to the app root.
- `apps/tma-client/next.config.ts`, `tmc-characters-maker/next.config.ts`, `tmc-scion/next.config.ts`: per-app Next.js config.

**Core Logic:**
- `apps/tma-client/src/features`: primary gameplay domain code.
- `apps/tma-client/src/store/useTmaStore.ts`: primary global client state.
- `tmc-characters-maker/components/CharacterEditor.tsx`: character editing shell.
- `tmc-scion/app/chatroom/[id]/page.tsx`: chatroom interaction shell.

**Testing:**
- Not detected. No dedicated `test`, `tests`, `__tests__`, `*.spec.*`, or `*.test.*` files were found in the mapped application code.

## Naming Conventions

**Files:**
- App Router route files use framework names: `layout.tsx`, `page.tsx`, `route.ts`, `middleware.ts`.
- Feature helpers use plain domain names such as `api.ts`, `server-api.ts`, and `privacy_api.ts`.
- Zustand stores use `*Store.ts` or `use*Store.ts`: `tmc-scion/store/chatroomStore.ts`, `apps/tma-client/src/store/useTmaStore.ts`.
- React components use PascalCase filenames: `GlobalTmaRegistry.tsx`, `CharacterEditor.tsx`, `AdminRoomEditor.tsx`.

**Directories:**
- Route directories follow URL structure, including dynamic segments like `apps/tma-client/src/app/rooms/[roomId]` and `tmc-scion/app/chatroom/[id]`.
- Feature folders are lowercase and domain-oriented: `apps/tma-client/src/features/exploration`, `apps/tma-client/src/features/investigation`.
- Shared subfolders typically use `components`, `store`, `lib`, `utils`, or `hooks`.

## Where to Add New Code

**New gameplay feature in the primary app:**
- Primary code: `apps/tma-client/src/features/<feature-name>/`
- Route entry: `apps/tma-client/src/app/<route>/page.tsx` or `apps/tma-client/src/app/<route>/layout.tsx`
- Shared state: extend `apps/tma-client/src/store/useTmaStore.ts` only if the state is genuinely cross-feature

**New TMA client API endpoint:**
- Implementation: `apps/tma-client/src/app/api/<endpoint>/route.ts`
- Server-side data helper: `apps/tma-client/src/features/<feature-name>/server-api.ts` if the same query is reused by server pages

**New Character Vault screen or endpoint:**
- Route/UI: `tmc-characters-maker/app/<segment>/page.tsx`
- Shared editor UI: `tmc-characters-maker/components/`
- Supabase helper: `tmc-characters-maker/utils/supabase/` only for client/server construction, not business logic

**New S.C.I.O.N feature:**
- Route/UI: `tmc-scion/app/<segment>/page.tsx`
- Store logic: `tmc-scion/store/<domain>Store.ts`
- Shared component: `tmc-scion/components/`

**Utilities:**
- TMA client shared helpers: `apps/tma-client/src/lib` for framework/infrastructure helpers, `apps/tma-client/src/utils` or `apps/tma-client/src/features/shared/utils` for app utilities
- Character Vault helpers: `tmc-characters-maker/utils`
- S.C.I.O.N helpers: `tmc-scion/lib` or `tmc-scion/hooks`

**Shared code across apps:**
- Preferred location: `packages/<package-name>/`
- Current state: `packages/` is empty, so do not scatter new shared code across app roots unless it is truly app-specific

## Special Directories

**`.planning/codebase`:**
- Purpose: Generated codebase reference docs for GSD workflows.
- Generated: Yes
- Committed: Yes

**`apps/tma-client/.next`:**
- Purpose: Next.js build and dev output.
- Generated: Yes
- Committed: No by convention; present in the working tree snapshot

**`apps/tma-client/scratch` and `apps/tma-client/src/scratch`:**
- Purpose: Ad hoc diagnostics and temporary experiments.
- Generated: No
- Committed: Yes

**`tmc-scion/References`:**
- Purpose: Static design/reference images for the S.C.I.O.N interface.
- Generated: No
- Committed: Yes

**`*.sql` at repo root and under `tmc-characters-maker/`:**
- Purpose: Manual schema and migration snapshots.
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-04-26*
