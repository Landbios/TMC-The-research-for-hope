# Phase 1: Terminal Polish & Global Notifications - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase focuses strictly on the aesthetics and persistence of the Nervalis "Command Center" terminal, plus a minimal HUD notification system for incoming background alerts.
</domain>

<decisions>
## Implementation Decisions

### Notifications
- **Minimal HUD Indicator:** Add a pulsing icon/line to alert the user of new group chat messages or active polls when the terminal is *closed*.
- **Location:** It should be unobtrusive, likely near the Nervalis toggle icon.

### Terminal Personality
- **Purely Visual Personality:** Implement CRT scanlines, subtle screen curvature, glitch-in/out animations via Framer Motion. Don't add voice lines or an AI persona.

### Persistence
- **Draggable Window:** Window should keep its screen position and active tab/scroll when closed and reopened.

</decisions>

<canonical_refs>
## Canonical References
No external specs. Requirements fully captured above and in REQUIREMENTS.md.
</canonical_refs>

<specifics>
## Specific Ideas
- Use framer-motion `layoutId` to ensure the glitch animations don't negatively impact the 3D room's rendering framerate.
- Leverage the existing `InsideRoomArena.tsx` real-time subscriptions to trigger the HUD notification.
</specifics>

<deferred>
## Deferred Ideas
- Navigation adjustments (Room list) are deferred to Phase 2.
- Character Possession and Admin tabs are deferred to Phase 3.
</deferred>
