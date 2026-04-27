# Phase 03: Profile System Migration - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase migrates and refines the student identity and administrative control systems into the unified Nervalis terminal. It replaces the basic profile views with data-rich, interactive tabs.

</domain>

<decisions>
## Implementation Decisions

### [SELF Tab]
- **Vitality Bar**: Visual indicator of character status (ALIVE/DEAD/etc).
- **Neural Capacity Bar**: Visual representation of Investigation Points (IP).
- **Murder Points**: Displayed only for Assassins.
- **Visuals**: Use blue glow and scanline effects consistent with Nervalis 2.0.

### [PROFILES Tab]
- **Search Filter**: Real-time filtering of students by name or title.
- **Badges**: Distinct visual markers for PCs vs NPCs in the student list.
- **Extended Metadata**: Display Age, Height, and Biography in the selection preview.

### [ADMIN Tab]
- **Neural Overwrite**: Rename "Inyectar Posesión" to "Neural Overwrite" and add red glitch/warning effects to distinguish it from standard student interactions.
- **Diagnostic Info**: Add system-themed metadata (Sync levels, Core status) to the header.

</decisions>

<canonical_refs>
## Canonical References

- `apps/tma-client/src/features/dashboard/components/NervalisOverlay.tsx` — Main terminal container and tab logic.
- `apps/tma-client/src/store/useTmaStore.ts` — State management for possession and character data.
- `apps/tma-client/src/features/characters/api.ts` — Data structures for student profiles.

</canonical_refs>

<specifics>
## Specific Ideas
- Use Framer Motion for the status bar filling animations.
- Use Lucide icons (Heart, Zap, Target) for stats.

</specifics>

---

*Phase: 03-profile-system-migration*
*Context gathered: 2026-04-26*
