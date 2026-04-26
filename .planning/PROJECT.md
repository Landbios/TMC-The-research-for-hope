# Project: TMC - The Research for Hope

Consolidating all investigation, communication, and navigation systems into a unified, high-personality terminal interface (Nervalis 2.0) for an immersive Cyberpunk mystery experience.

## Core Value
To centralize the player's agency through a single, persistent "Command Center" that reduces HUD clutter and enhances immersion through deep visual personality and real-time environmental awareness.

## Context
A web-based (Next.js/React) social investigation game set in a high-tech academy. Players explore 3D environments, interact with other students, and solve murders. The "Nervalis" terminal is the primary interface for system-wide interactions.

## Requirements

### Validated
- ✓ **3D Room Engine**: Functional WebGL-based room visor with character and evidence sprites.
- ✓ **Neural Possession**: Admin-tier ability to switch controlled characters.
- ✓ **Basic Stealth**: Stealth entry mechanics and visual filters.
- ✓ **Primary Logs**: Chronological investigation and system logs.
- ✓ **Multi-Environment Chat**: Cross-room communication capabilities.
- ✓ **Nervalis 2.0 Personality**: High-personality visual themes with CRT scanlines and glitch effects. — Phase 1
- ✓ **Evidence Poll Consolidation**: Investigation polls moved to unified EVIDENCE tab. — Phase 01.1

### Active
- [ ] **Unified Social Migration**: Move group chats into specialized Nervalis tabs.
- [ ] **Live-Intel Navigation**: Replace 3D map with a dynamic room list showing student presence, privacy status, and maintenance alerts.
- [ ] **Staff Control Tab**: Dedicated "ADMIN" tab for character switching/possession (Role-based access).
- [ ] **Notification Center**: Minimal HUD indicator that alerts users to pings/events when Nervalis is closed.
- [ ] **Personal File**: A "SELF" tab where students can view their own profile and status.

### Out of Scope
- **3D Fast Travel**: No procedural movement between rooms; navigation remains list-based for efficiency.
- **AI Personalities**: Voice/Text responses from the terminal itself (Nervalis is purely visual/functional for now).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **List-based Navigation** | Enhances performance and provides clearer "Live Intel" metadata than the 3D map. | — Pending |
| **Consolidated HUD** | Moving group chats/polls into Nervalis simplifies the main screen and focuses immersion on the terminal. | — Pending |
| **Tab Consolidation** | Renamed POLLS to EVIDENCE to serve as both active poll UI and historical archive. | — Complete |
| **Decoupled Modals** | PrivacyPollModal moved outside Nervalis to allow room-blocking logic to function independently. | — Complete |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

---
*Last updated: 2026-04-26 after Phase 01.1*
