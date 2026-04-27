---
status: complete
phase: 01-terminal-polish-global-notifications
source: [01-PLAN-01-SUMMARY.md]
started: "2026-04-13T06:12:00.000Z"
updated: "2026-04-13T06:16:43.000Z"
---

## Current Test

[testing complete]

## Tests

### 1. Terminal Drag Persistence
expected: Open the Nervalis terminal and drag it to a new location on the screen. Close the terminal and reopen it. The terminal should reappear in the exact same position where it was previously left.
result: pass

### 2. CRT Scanlines Polish
expected: When viewing the Nervalis terminal, CRT scanline effects with a clear backdrop-blur should be visible, evoking a cyberpunk setting, without blocking interaction with the content inside the terminal.
result: pass

### 3. Global Notification Indicator
expected: While the Nervalis terminal is closed, receiving a new global chat message or new evidence poll should cause a blinking notification indicator to appear on the Nervalis access button. Opening the terminal should clear this indicator.
result: issue
reported: "it works with the messages but there isnt any notification on evidence poll since the evidence poll doesnt work"
severity: major

## Summary

total: 3
passed: 2
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "While the Nervalis terminal is closed, receiving a new global chat message or new evidence poll should cause a blinking notification indicator to appear on the Nervalis access button. Opening the terminal should clear this indicator."
  status: failed
  reason: "User reported: it works with the messages but there isnt any notification on evidence poll since the evidence poll doesnt work"
  severity: major
  test: 3
  root_cause: "The evidence poll GUI is legacy and currently broken/conflicting. It was not migrated to Nervalis yet, which is why the poll fails entirely."
  artifacts:
    - path: "src/features/dashboard/components/GlobalPollOverlay.tsx"
      issue: "Legacy modal UI for evidence poll"
  missing:
    - "Migrate evidence poll to Nervalis terminal tab"
    - "Remove evidence poll from GlobalPollOverlay"
  debug_session: .planning/debug/evidence-poll.md
