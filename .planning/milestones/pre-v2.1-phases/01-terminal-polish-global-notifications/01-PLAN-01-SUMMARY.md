---
phase: 01
plan: 01
subsystem: dashboard
tags: [ui, state, polish]
requires: []
provides: [terminal-persistence, global-notifications]
affects: [NervalisOverlay, useTmaStore, GlobalTmaRegistry]
tech-stack:
  added: [framer-motion]
  patterns: [Zustand persistence, Real-time listeners]
key-files:
  created: [src/components/GlobalNotificationListener.tsx]
  modified: [src/store/useTmaStore.ts, src/features/dashboard/components/NervalisOverlay.tsx, src/app/dashboard/page.tsx, src/features/investigation/components/PollRealtimeListener.tsx, src/components/GlobalTmaRegistry.tsx]
key-decisions:
  - "Increased CRT scanline opacity for better visual personality."
  - "Centralized global notifications in a new GlobalNotificationListener component."
requirements-completed: [TERM-01, NOTIF-01]
duration: 25 min
completed: 2026-04-13
---

# Phase 01 Plan 01: Terminal Polish & Global Notifications Summary

Implemented a high-personality draggable terminal with persistence and a global notification system for background events.

## Key Changes

- **Draggable Persistence**: Refactored `NervalisOverlay` with `framer-motion` to support persistent positioning tracked in `useTmaStore`.
- **Aesthetic Polish**: Enhanced the CRT effect with increased scanline visibility and better backdrop-blur for a "high-tech/low-life" feel.
- **Global Notifications**:
  - Implemented `GlobalNotificationListener` to trigger unread signals for global chat messages.
  - Added notification triggers for new evidence polls in `PollRealtimeListener`.
  - Added blinking notification indicator to the `NervalisAccessButton`.
- **Bug Fix**: Resolved a double-rendering issue where the terminal was being initialized twice on the dashboard.

## Verification Results

- [x] **Store Sync**: `terminalPosition` updates in State on drag end.
- [x] **Visuals**: CRT scanlines are clearly visible and scale correctly.
- [x] **Notifications**: Test triggers verify that `hasUnreadSignals` flag activates correctly when messages arrive.

## Post-Completion Notes

The project now has a robust baseline for Terminal functionality. Future phases can now rely on `hasUnreadSignals` for any background event that requires user attention.

## Self-Check: PASSED
