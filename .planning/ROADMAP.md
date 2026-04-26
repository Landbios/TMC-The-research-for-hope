# Roadmap: Nervalis 2.0 OVERHAUL

This roadmap outlines the transformation of Nervalis into a unified Command Center.

## Milestone 1: Aesthetic & Identity
**Goal**: Establish the "Cyberpunk Terminal" personality and persistent awareness.

### Phase 1: Terminal Polish & Global Notifications [x]
- [x] Implement enhanced CRT/Scanline visual effects and glitch transitions. (completed 2026-04-13)
- [x] Add the "Minimal HUD" notification indicator for background events. (completed 2026-04-13)
- [x] Finalize draggable constraints and persistence in `NervalisOverlay.tsx`. (completed 2026-04-13)
- **UAT**: Terminal feels premium/alive; Notifications trigger correctly during closed state. ✓

## Milestone 2: Functional Core
**Goal**: Centralize navigation and critical social mechanics.

### Phase 01.1: Evidence Poll Consolidation (INSERTED) [x]

**Goal:** Consolidate investigation poll logic from `GlobalPollOverlay` into the unified `NervalisOverlay` terminal.
**Requirements**: REQ-EVIDENCE-01 through REQ-EVIDENCE-04
**Depends on:** Phase 1
**Plans:** 1/1 plans complete

Plans:
- [x] Plan 01: Consolidate evidence polling logic (completed 2026-04-26)

### Phase 01.2: Debugging & Stabilization (INSERTED)

**Goal:** Resolve accumulated UI inconsistencies and system-wide bugs following terminal consolidation.
**Requirements**: 
- Fix rendering lag in CRT effects.
- Audit state synchronization for "hasUnreadSignals".
- Resolve z-index conflicts between terminal and pop-ups.
**Depends on:** Phase 01.1
**Plans:** 0 plans

### Phase 2: Live-Intel Room Navigation
- [ ] Replace `AcademyMap` with a dynamic Room List component.
- [ ] Integrate real-time student presence and room status metadata (Private/Maintenance).
- [ ] Connect list-based navigation to the `InsideRoomArena` routing logic.
- **UAT**: Users can navigate rooms via the terminal; Room status updates in real-time.

### Phase 3: Profile System Migration
- [ ] Create the "SELF" tab for personal student stats and IP.
- [ ] Implement the "ADMIN" (Staff-only) tab for Neural Possession.
- [ ] Refactor the "DB" (Students) tab for deeper info display.
- **UAT**: Personal sheet accessible; Admin character switching functional.

## Milestone 3: Full Integration
**Goal**: Deprecate legacy HUD elements.

### Phase 4: Social & Logic Migration
- [ ] Integrate Group Chat history/view into the CHAT tab.
- [ ] Move Evidence/Privacy Polls into a dedicated terminal workflow.
- [ ] General UI cleanup of unneeded screen-space HUD elements.
- **UAT**: All game functions accessible from Nervalis; Standard HUD is clean.

---
*Created: 2026-04-11*
*Status: Initializing Phase 1*
