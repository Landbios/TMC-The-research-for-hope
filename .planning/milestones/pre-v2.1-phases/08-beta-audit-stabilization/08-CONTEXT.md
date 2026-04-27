# Phase 08: Beta Audit & Stabilization - Context

## Goal
To perform a final end-to-end verification of all core systems (Nervalis 2.0, SCION AI, Role-based visibility) and resolve any lingering stability or visual issues before beta testing.

## Focus Areas
1.  **Murder Coordination Loop**: Verify that the transition from Poll -> Selection -> Coordination -> Finalization (AI Summary) is flawless.
2.  **AI Reliability**: Harder error handling for Gemini 429/500 errors.
3.  **Visual Consistency**: Ensure scanlines, glitches, and the unified terminal look remain consistent across different routes.
4.  **Admin Tools**: Verify that clearing logs and resetting cases works as intended without stale state.

## Current State
- Phases 06 and 07 are complete.
- Gemini 1.5 Flash is integrated for both case summaries and dynamic clues.
- Role-based visibility for polls and staff tools is implemented.

## Success Criteria
- [ ] No major errors in the browser console during a full murder loop.
- [ ] Gemini API failures are handled with a fallback "System Offline" message instead of a crash.
- [ ] NPC Switcher remains hidden in rooms and visible on the map.
