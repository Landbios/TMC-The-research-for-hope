# Roadmap: Milestone 2.0 - Beta Readiness & Tactical Polish

## Overview
Continuing from the Nervalis 2.0 interface overhaul, this roadmap focuses on the "Tactical" layer—ensuring the AI and role-based logic are ready for a public beta audience.

## Phase 06: Tactical UI Scoping [COMPLETED]
**Goal**: Refine tool visibility and poll logic.
- [x] Update `GlobalPollOverlay.tsx` to support non-possessing Staff in the Assassination Poll.
- [x] Implement route-based hiding for `StaffIdentitySwitcher`.
- [x] Audit `useTmaStore` to ensure `isPossessing` logic is consistent.
- **UAT**: Staff can see polls when "themselves" but tools are hidden in rooms.

## Phase 07: Intelligence Integration (Gemini) [COMPLETED]
**Goal**: Connect the "SCION" AI Case Builder.
- [x] Create a Next.js API route/Server Action for Gemini integration.
- [x] Implement log-gathering logic for murder coordination rooms.
- [x] Update the `finalizeAssassination` flow to use real AI results.
- **UAT**: A unique summary is generated at the end of every coordination phase.

## Phase 08: Beta Audit & Stabilization
**Goal**: Final bug-bash and UX polish.
- [ ] Full end-to-end test of the "Murder-to-Discovery" loop.
- [ ] Fix any visual glitches in the CRT/Glitch effects on different screen sizes.
- [ ] Finalize `.planning` documentation for handover to beta testers.
- **UAT**: 100% stability on core loops.

---
*Created: 2026-04-26*
*Current Version: v1.1-planning*
