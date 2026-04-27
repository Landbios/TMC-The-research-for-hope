## Phase 04: Social & Logic Migration - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase refines the social interaction layer by integrating room-specific chat into the Nervalis terminal.

</domain>

<decisions>
## Implementation Decisions

### [CHAT Tab Refactor]
- **Room Switching**: `VerticalChatLog` must dynamically switch between the Global Room and the player's current room.
- **Visual Distinction**: Room messages should have a slightly different accent (e.g., green-tinted border) than Global messages (blue-tinted).
- **Persistence**: Ensure channel selection is preserved during the terminal session.

</decisions>

<canonical_refs>
## Canonical References

- `apps/tma-client/src/features/dashboard/components/VerticalChatLog.tsx` — Chat logic.

</canonical_refs>

<specifics>
## Specific Ideas
- Add a "Channel Selector" button at the bottom of the CHAT tab to toggle between [GLOBAL] and [LOCAL_ROOM].
- Use a sound effect (already implemented via `toast`) when the EVENTS tab receives a new poll.

</specifics>

---

*Phase: 04-social-logic-migration*
*Context gathered: 2026-04-26*
