# Project: TMC - The Research for Hope

Consolidating all investigation, communication, and navigation systems into a unified, high-personality terminal interface (Nervalis 2.0) for an immersive Cyberpunk mystery experience.

## Core Value
To centralize the player's agency through a single, persistent "Command Center" that reduces HUD clutter and enhances immersion through deep visual personality and real-time environmental awareness.

## Current State
- **Shipped Version**: v1.0 (Nervalis 2.0 Overhaul)
- **Last Release**: 2026-04-26
- **Status**: Stable / Milestone Complete

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
- ✓ **Unified Social Migration**: Global and Room-specific chat channels integrated into Nervalis. — Phase 4
- ✓ **Live-Intel Navigation**: 3D map updated with student presence and privacy status. — Phase 2
- ✓ **Staff Control Tab**: Dedicated "ADMIN" tab for character switching/possession (Role-based access). — Phase 3
- ✓ **Notification Center**: Minimal HUD indicator that alerts users to pings/events when Nervalis is closed. — Phase 1
- ✓ **Personal File**: A "SELF" tab where students can view their own profile and status. — Phase 3
- ✓ **System Hardening**: Resolved identity-switching race conditions and poll modal persistence. — Phase 5

### Active
- [ ] **Assassination Poll Scoping**: Ensure the poll appears for Roleplayers and non-possessing Staff.
- [ ] **Gemini AI Case Builder**: Integrate real Gemini API to summarize murder planning stages based on actual room logs.
- [ ] **UI Visibility Rules**: Restrict NPC Selector to Map and Nervalis views; hide in rooms.
- [ ] **Beta Stabilization**: Final audit of vital systems (IP, MP, Privacy) for public testing.

### Out of Scope
- **3D Fast Travel**: No procedural movement between rooms; navigation remains list-based for efficiency.
- **AI Personalities**: Voice/Text responses from the terminal itself (Nervalis is purely visual/functional for now).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Atomic Initialization** | Prevents race conditions during identity switching (Staff/NPC) to ensure correct room relocation. | — Complete |
| **List-based Navigation** | Enhances performance and provides clearer "Live Intel" metadata than the 3D map. | — Complete |
| **Consolidated HUD** | Moving group chats/polls into Nervalis simplifies the main screen and focuses immersion on the terminal. | — Complete |
| **Tab Consolidation** | Renamed POLLS to EVIDENCE to serve as both active poll UI and historical archive. | — Complete |
| **Decoupled Modals** | PrivacyPollModal moved outside Nervalis to allow room-blocking logic to function independently. | — Complete |

## Evolution
This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-26 after Phase 5 Completion*
