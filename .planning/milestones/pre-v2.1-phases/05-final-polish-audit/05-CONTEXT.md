# Phase 05: Final Polish & System Audit - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase serves as the final wrap-up for the Nervalis 2.0 overhaul. It focuses on resolving lingering bugs, auditing character movement logic, and ensuring all HUD elements are polished and consistent.

</domain>

<decisions>
## Implementation Decisions

### [Staff Movement Logic Audit]
- **Issue**: Staff moving rooms sometimes triggers movement for all possessed characters instead of just the active one.
- **Decision**: Harden the movement action to use the `myCharacterId` from the store exclusively, ensuring no bulk updates occur unless intended.

### [Privacy Poll Stability]
- **Issue**: Modals re-appearing after resolution.
- **Decision**: Implement a cleanup hook or explicit state clear on poll resolution to prevent stale UI states.

### [UI Polish]
- **Focus**: Final z-index audit, ensuring no overlaps between Nervalis, Room Visor, and Chat.
- **Theming**: Add minor "boot sequence" or "shutdown" animations to Nervalis if requested (or as a polish item).

</decisions>

<canonical_refs>
## Canonical References

- `apps/tma-client/src/features/exploration/components/AcademyMap.tsx` — Movement logic.
- `apps/tma-client/src/features/exploration/components/PrivacyPollModal.tsx` — Poll logic.
- `apps/tma-client/src/store/useTmaStore.ts` — Global state.

</canonical_refs>

---

*Phase: 05-final-polish-audit*
*Context gathered: 2026-04-26*
