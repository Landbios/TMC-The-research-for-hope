# Project: TMC - The Research for Hope

Consolidating all investigation, communication, and navigation systems into a unified, high-personality terminal interface while making the codebase safer to evolve, easier to deploy, and easier to reason about.

## Core Value
To centralize the player's agency through a single, persistent "Command Center" that reduces HUD clutter and enhances immersion through deep visual personality and real-time environmental awareness.

## Current State
- **Shipped Version**: v1.0 (Nervalis 2.0 Overhaul)
- **Last Completed Milestone**: v2.0 (Beta Readiness & Tactical Polish)
- **Status**: Planning Milestone v2.1

## Context
A web-based Next.js/React social investigation game set in a high-tech academy. Players explore 3D environments, interact with other students, and solve murders. The "Nervalis" terminal remains the primary interface for system-wide interactions. The active production app lives in `apps/tma-client`, while `tmc-scion` and `tmc-characters-maker` remain workspace-local reference repos that should stay ignored by Git.

## Current Milestone: v2.1 Repository & Architecture Improvements

**Goal:** Simplify repository operations and strengthen internal architecture without breaking live gameplay behavior.

**Target features:**
- Clarify the repo operating model around one deployable app in `apps/tma-client`.
- Keep cloned/reference repos in the workspace while excluding them from commits and deployment scope.
- Reorganize the app around clearer modules, shared primitives, infrastructure helpers, and single-responsibility components.
- Reduce data-layer coupling by separating Supabase repositories/services from render-heavy UI.
- Improve deployment readiness for Vercel, plus low-risk performance and database-boundary improvements.

## Requirements

### Validated
- ✓ **3D Room Engine**: Functional WebGL-based room visor with character and evidence sprites.
- ✓ **Neural Possession**: Admin-tier ability to switch controlled characters.
- ✓ **Basic Stealth**: Stealth entry mechanics and visual filters.
- ✓ **Primary Logs**: Chronological investigation and system logs.
- ✓ **Multi-Environment Chat**: Cross-room communication capabilities.
- ✓ **Nervalis 2.0 Personality**: High-personality visual themes with CRT scanlines and glitch effects. - Phase 1
- ✓ **Evidence Poll Consolidation**: Investigation polls moved to unified EVIDENCE tab. - Phase 01.1
- ✓ **Live-Intel Navigation**: 3D map updated with student presence and privacy status. - Phase 2
- ✓ **Unified Social Migration**: Global and Room-specific chat channels integrated into Nervalis. - Phase 4
- ✓ **Staff Control Tab**: Dedicated "ADMIN" tab for character switching/possession (role-based access). - Phase 3
- ✓ **Personal File**: A "SELF" tab where students can view their own profile and status. - Phase 3
- ✓ **Notification Center**: Minimal HUD indicator that alerts users to pings/events when Nervalis is closed. - Phase 1
- ✓ **System Hardening**: Resolved identity-switching race conditions and poll modal persistence. - Phase 5
- ✓ **Assassination Poll Scoping**: Poll visibility supports roleplayers and non-possessing staff. - Phase 06
- ✓ **Gemini AI Case Builder**: Real AI summaries can be generated from gameplay context. - Phase 07
- ✓ **UI Visibility Rules**: The identity switcher is scoped away from immersive room views. - Phase 06
- ✓ **Beta Stabilization**: Tactical beta-readiness audit and final polish completed. - Phase 08

### Active
- [ ] **Repo Operating Model**: Make root scripts, ignored reference repos, and deployment scope explicit and reliable.
- [ ] **Architecture Boundary Cleanup**: Move toward feature-first modules, app-shell separation, and single-responsibility components.
- [ ] **Data Layer Hardening**: Reduce direct Supabase calls inside render-heavy components and standardize client/server/runtime boundaries.
- [ ] **Deployment & Performance Guardrails**: Add Vercel-ready build conventions, validation steps, and targeted hot-path improvements.

### Out of Scope
- **Moving `apps/tma-client` to repo root**: Vercel can deploy from a subdirectory, so root flattening is churn without enough benefit.
- **Replacing Supabase or Zustand**: This milestone improves boundaries around the current stack instead of swapping core technology.
- **Cross-app unification with `tmc-scion` or `tmc-characters-maker`**: Those repos stay as reference-only workspace neighbors for now.
- **Large-scale schema redesign**: Database improvements should stay additive and low-risk in this milestone.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Atomic Initialization** | Prevents race conditions during identity switching (Staff/NPC) to ensure correct room relocation. | - Complete |
| **List-based Navigation** | Enhances performance and provides clearer "Live Intel" metadata than the 3D map. | - Complete |
| **Consolidated HUD** | Moving group chats and polls into Nervalis simplifies the main screen and focuses immersion on the terminal. | - Complete |
| **Tab Consolidation** | Renamed POLLS to EVIDENCE to serve as both active poll UI and historical archive. | - Complete |
| **Decoupled Modals** | PrivacyPollModal moved outside Nervalis to allow room-blocking logic to function independently. | - Complete |
| **Keep `apps/tma-client` as the deployable app root** | Vercel monorepo support removes the need for a risky repo-root app migration. | - Locked for v2.1 |
| **Keep reference repos in-workspace but Git-ignored** | They are useful for agent/reference context without belonging to the production deploy surface. | - Locked for v2.1 |
| **Prefer incremental strangler refactors over a big-bang rewrite** | The game has coupled realtime, store, and Supabase flows that need safer seams before deeper restructuring. | - Locked for v2.1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. Project framing drifted? -> Update context and milestone notes

**After each milestone**:
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state and next milestone direction

---
*Last updated: 2026-04-26 after milestone v2.1 initialization*
