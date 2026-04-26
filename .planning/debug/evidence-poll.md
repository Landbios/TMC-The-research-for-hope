## ROOT CAUSE FOUND

**Debug Session:** .planning/debug/evidence-poll.md

**Root Cause:** The evidence poll UI currently resides in the legacy `GlobalPollOverlay.tsx` which is rendering as an intrusive modal, conflicting with the new Nervalis UX and failing to operate properly according to UAT. The notification is functional in `PollRealtimeListener`, but since the poll itself doesn't work in the existing setup, the whole feature fails.

**Evidence Summary:**
- `PollRealtimeListener` was updated to trigger `setHasUnreadSignals(true)`
- BUT `GlobalPollOverlay.tsx` still contains the legacy implementation of the investigation poll UI.
- The UI migration to Nervalis hasn't happened yet (scheduled for Phase 01.1).

**Files Involved:**
- src/features/dashboard/components/GlobalPollOverlay.tsx: Legacy poll UI
- src/features/investigation/components/PollRealtimeListener.tsx: Event listener triggering notification

**Suggested Fix Direction:** Execute Phase 01.1 to migrate the evidence poll into the Nervalis terminal tab and remove it from `GlobalPollOverlay`.
