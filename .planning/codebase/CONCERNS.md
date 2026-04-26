# Codebase Concerns

**Analysis Date:** 2026-04-26

## Tech Debt

**Client-side privileged game mutations:**
- Issue: Core game administration and mutation flows run from browser-side modules through the public Supabase client instead of server actions or authenticated route handlers.
- Files: `apps/tma-client/src/features/admin/api.ts`, `apps/tma-client/src/features/characters/api.ts`, `apps/tma-client/src/features/investigation/api.ts`, `apps/tma-client/src/features/exploration/privacy_api.ts`, `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`
- Impact: Authorization depends almost entirely on Supabase RLS. Any missing or overly broad policy exposes global state changes such as assassin assignment, room privacy changes, evidence deletion, or point resets.
- Fix approach: Move privileged mutations behind server-only entry points in `src/app/api/**` or server actions, re-check role/ownership on the server, and leave the browser responsible only for invoking those endpoints.

**Monolithic room runtime:**
- Issue: The room experience is concentrated in one large component that mixes access control, data loading, realtime subscriptions, timers, chat routing, evidence state, and admin tools.
- Files: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`
- Impact: Small changes carry regression risk across unrelated behavior. It is difficult to test, reason about, or optimize individual room concerns.
- Fix approach: Split into focused hooks and components such as `useRoomAccess`, `useRoomRealtime`, `useRoomEvidence`, and `useRoomChat`, then centralize shared Supabase access patterns.

**Global mutable client state with side effects:**
- Issue: The Zustand store owns identity, possession state, UI state, and persistence side effects such as `localStorage` writes.
- Files: `apps/tma-client/src/store/useTmaStore.ts`, `apps/tma-client/src/components/TmaStoreInitializer.tsx`
- Impact: Identity restoration, possession, and UI overlays can drift out of sync across refreshes, role changes, or partial initialization.
- Fix approach: Keep persistence and identity restoration in dedicated initialization hooks, constrain the store to serializable state transitions, and make possession restore/clear flows explicit and testable.

**Duplicated utilities and generated types:**
- Issue: Image upload/crop components and crop helpers exist in parallel locations, and multiple copies of generated database types are kept side by side.
- Files: `apps/tma-client/src/components/ui/ImageUploader.tsx`, `apps/tma-client/src/features/shared/components/ImageUploader.tsx`, `apps/tma-client/src/components/ui/ImageCropperModal.tsx`, `apps/tma-client/src/features/shared/components/ImageCropperModal.tsx`, `apps/tma-client/src/utils/cropImage.ts`, `apps/tma-client/src/features/shared/utils/cropImage.ts`, `apps/tma-client/database.types.ts`, `apps/tma-client/database.types_readable.ts`, `apps/tma-client/database.types.utf8.ts`
- Impact: Bug fixes and schema updates can land in one copy while other copies silently diverge.
- Fix approach: Keep one canonical implementation for shared UI/utilities and one canonical generated type file with a documented regeneration path.

**Placeholder and partially abandoned artifacts:**
- Issue: The repository contains empty files and scratch/debug artifacts alongside active source code.
- Files: `RETROMATOR.html`, `schema.sql`, `supabase_migrations_assassin_workflow.sql`, `supabase_migrations_tma_v4_assassin_reset.sql`, `apps/tma-client/src/scratch/check_lucide.ts`, `apps/tma-client/scratch/check_data_diagnostic.mjs`
- Impact: It is unclear which files are authoritative, which increases onboarding cost and schema drift risk.
- Fix approach: Remove empty placeholders, relocate diagnostics to a dedicated tooling folder, and document the authoritative migration/type generation workflow.

## Known Bugs

**Unauthorized room redirects target a non-existent route:**
- Symptoms: Users blocked from entering a room are redirected to `/exploration`, which is not implemented under `src/app`.
- Files: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`, `apps/tma-client/src/app/map/page.tsx`
- Trigger: Enter the murder coordination room or blocked crime scene without the required role.
- Workaround: Redirect manually to `/map` instead of relying on the current access-denied path.

**Judgement flow stops at a placeholder alert:**
- Symptoms: When investigation points reach zero, the UI offers a judgment-room action that only calls `alert(...)` and labels the feature W.I.P.
- Files: `apps/tma-client/src/features/dashboard/components/GlobalPollOverlay.tsx`
- Trigger: Reach investigation exhaustion during the `INVESTIGATION` period.
- Workaround: Staff must coordinate the next phase manually outside the implemented flow.

**Case reset deletes all evidence globally, not evidence scoped to the active case:**
- Symptoms: Resolving one case removes every evidence row using a sentinel `neq` filter instead of a case-specific filter.
- Files: `apps/tma-client/src/features/admin/api.ts`
- Trigger: Run `resolveCurrentCase(...)` from the admin dashboard.
- Workaround: Avoid using full reset in shared environments unless global evidence deletion is intended.

## Security Considerations

**Public client can perform staff-grade mutations:**
- Risk: Browser code can invoke global mutations such as `updateGameState`, `resetAllInvestigationPoints`, `assignAssassinStatus`, `clearRoomMessages`, and room/evidence updates.
- Files: `apps/tma-client/src/features/admin/api.ts`, `apps/tma-client/src/features/characters/api.ts`, `apps/tma-client/src/features/investigation/api.ts`, `apps/tma-client/src/features/exploration/privacy_api.ts`
- Current mitigation: UI gating by role checks in components and pages such as `apps/tma-client/src/app/admin/page.tsx`.
- Recommendations: Treat UI gating as cosmetic only. Enforce role and ownership checks in server-only mutation layers and verify RLS coverage for every table being mutated from the client.

**AI endpoints lack explicit auth, rate limiting, and payload constraints:**
- Risk: The Gemini-backed routes accept arbitrary request bodies and expose model-backed processing without visible per-user authorization or throttling.
- Files: `apps/tma-client/src/app/api/ai/case-builder/route.ts`, `apps/tma-client/src/app/api/ai/clue-generator/route.ts`
- Current mitigation: They fail closed when `GOOGLE_GENERATIVE_AI_API_KEY` is missing.
- Recommendations: Require authenticated callers, enforce role checks where appropriate, validate request schema and size, and replace raw `error.message` responses with sanitized failure messages.

**Client identity possession persists in local storage:**
- Risk: The active possessed character is restored from `localStorage` and then fetched client-side without a server-issued possession token.
- Files: `apps/tma-client/src/store/useTmaStore.ts`, `apps/tma-client/src/components/TmaStoreInitializer.tsx`
- Current mitigation: Possession is only surfaced in staff UI flows.
- Recommendations: Bind possession to a server-side session or signed server mutation, and treat `localStorage` only as a UI hint rather than authority.

## Performance Bottlenecks

**Room subscriptions listen broadly and filter on the client:**
- Problem: `InsideRoomArena` subscribes to all `tma_characters` changes for the table and then filters room membership in the callback.
- Files: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`
- Cause: The character realtime subscription omits a `current_room_id` filter even though the view is room-scoped.
- Improvement path: Scope realtime subscriptions by room where possible, or route all room-state updates through a narrower server projection.

**Room screen opens many concurrent realtime channels plus polling/timers:**
- Problem: Each room instance sets up multiple channels, message history loading, evidence refreshes, and an auto-close interval.
- Files: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`
- Cause: Chat, evidence, privacy polls, room metadata, and characters are all subscribed independently inside one component.
- Improvement path: Consolidate subscriptions, paginate room history, and avoid rebuilding channel sets when unrelated dependencies change.

**Admin polling uses fixed-interval fetches instead of event-driven updates:**
- Problem: Volunteer data is refreshed every five seconds while the polls tab is open.
- Files: `apps/tma-client/src/features/admin/components/AdminDashboard.tsx`
- Cause: The admin dashboard uses `setInterval` rather than a realtime subscription for volunteers.
- Improvement path: Replace polling with a filtered realtime subscription or a single server-backed admin feed.

## Fragile Areas

**Store initialization and possession restoration:**
- Files: `apps/tma-client/src/components/TmaStoreInitializer.tsx`, `apps/tma-client/src/store/useTmaStore.ts`, `apps/tma-client/src/features/admin/components/StaffIdentitySwitcher.tsx`
- Why fragile: Initialization is one-shot, asynchronous, and role-sensitive. A stale `tma_possessed_id` can change the active character path before the rest of the store is fully synchronized.
- Safe modification: Change initialization, possession, and logout/reset behavior together and verify refresh, role change, and hard-reload scenarios.
- Test coverage: No automated tests cover possession restore, original-character fallback, or store rehydration.

**Room access, stealth, and privacy control path:**
- Files: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`, `apps/tma-client/src/features/exploration/privacy_api.ts`
- Why fragile: Access control, stealth updates, room-entry writes, and privacy polls are interleaved with navigation and UI toasts in one code path.
- Safe modification: Separate authorization decisions from side effects, then verify blocked-entry, stealth success, stealth failure, and private-room entry flows independently.
- Test coverage: No automated tests cover room-entry enforcement or privacy poll resolution.

**Admin case lifecycle tools:**
- Files: `apps/tma-client/src/features/admin/components/AdminDashboard.tsx`, `apps/tma-client/src/features/admin/api.ts`
- Why fragile: High-impact destructive actions are triggered from the browser and combine multiple writes with partial failure handling.
- Safe modification: Convert each destructive workflow to a server transaction boundary and add dry-run or confirmation-state checks before deletion/reset actions.
- Test coverage: No automated tests cover case reopen, case resolve, log cleanup, or assassin selection flows.

## Scaling Limits

**Realtime room model:**
- Current capacity: One browser session opens multiple Supabase channels per room and keeps room-local state in memory.
- Limit: As concurrent rooms, messages, and character updates grow, client subscription overhead and table-wide listeners become increasingly expensive.
- Scaling path: Reduce per-room channel count, scope subscriptions by room, and move fan-out logic to server-controlled aggregates or views.

**Message history and chat projection:**
- Current capacity: Room history loads only the latest 50 rows, then relies on live inserts.
- Limit: Larger histories are truncated, and missing sender context or reconnect drift can make the in-memory conversation inconsistent.
- Scaling path: Add paginated history APIs, stable reconciliation for reconnects, and explicit chat projections for whispers vs. room chat.

## Dependencies at Risk

**Gemini model/version hardcoding:**
- Risk: Both AI routes pin `gemini-1.5-flash` directly in source with no abstraction or fallback.
- Impact: Provider deprecations or behavior changes require code edits in multiple places and can break clue/case generation suddenly.
- Migration plan: Centralize model selection and provider config in one server-side AI module and make model choice environment-configurable.

**Schema/type drift between SQL and generated types:**
- Risk: The repo carries multiple database type snapshots plus separate SQL migration files, some of which are empty placeholders.
- Impact: Client code can compile against stale schema assumptions while operational SQL evolves elsewhere.
- Migration plan: Keep one generated type artifact, document the regeneration command, and establish one authoritative migration directory.

## Missing Critical Features

**Automated test suite:**
- Problem: Neither the root workspace nor `apps/tma-client` defines test commands or first-party `*.test.*` / `*.spec.*` files.
- Blocks: Safe refactoring of room runtime, admin mutations, and store initialization remains high risk because regressions are only catchable manually.

**Implemented judgement-room transition:**
- Problem: Investigation exhaustion only presents a W.I.P overlay and an `alert(...)` call.
- Blocks: The end-to-end gameplay loop from investigation into judgment is incomplete in production code.

## Test Coverage Gaps

**Auth and authorization boundaries:**
- What's not tested: Middleware redirects, admin-page role enforcement, and protection of privileged mutations.
- Files: `apps/tma-client/src/middleware.ts`, `apps/tma-client/src/lib/supabase/middleware.ts`, `apps/tma-client/src/app/admin/page.tsx`, `apps/tma-client/src/features/admin/api.ts`
- Risk: Access-control regressions can ship unnoticed, especially because browser-side mutations already assume strong backend policy coverage.
- Priority: High

**Realtime room behavior:**
- What's not tested: Subscription cleanup, chat fan-out, visibility filtering for hidden characters, privacy poll overlays, and evidence synchronization.
- Files: `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`, `apps/tma-client/src/features/investigation/components/PollRealtimeListener.tsx`, `apps/tma-client/src/components/GlobalCharacterListener.tsx`, `apps/tma-client/src/components/GlobalNotificationListener.tsx`
- Risk: Memory leaks, stale state, duplicate events, and missing updates can appear only under live multi-user conditions.
- Priority: High

**Store and possession flows:**
- What's not tested: Original-character capture, possession restore from `localStorage`, reset behavior, and role-sensitive identity switching.
- Files: `apps/tma-client/src/store/useTmaStore.ts`, `apps/tma-client/src/components/TmaStoreInitializer.tsx`, `apps/tma-client/src/features/admin/components/StaffIdentitySwitcher.tsx`
- Risk: A broken possession flow can leave staff acting as the wrong character or unable to restore the original identity cleanly.
- Priority: High

**Admin destructive workflows:**
- What's not tested: Evidence deletion, room reopen/reset, assassin selection, point resets, and log cleanup.
- Files: `apps/tma-client/src/features/admin/api.ts`, `apps/tma-client/src/features/admin/components/AdminDashboard.tsx`
- Risk: High-impact irreversible actions can partially fail or affect the wrong records without detection.
- Priority: High

---

*Concerns audit: 2026-04-26*
