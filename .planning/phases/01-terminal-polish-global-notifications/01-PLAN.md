---
wave: 1
depends_on: []
files_modified:
  - src/store/useTmaStore.ts
  - src/features/dashboard/components/NervalisOverlay.tsx
  - src/features/dashboard/components/VerticalChatLog.tsx
  - src/features/exploration/components/InsideRoomArena.tsx
  - src/features/dashboard/components/NervalisToggleButton.tsx
autonomous: true
---

# Phase 1: Terminal Polish & Global Notifications

## Objective
Implement a draggable, persistent terminal with a "Cyberpunk" aesthetic (glitches, scanlines) and add a minimal HUD indicator for unread background signals.

## Tasks

<task>
  <id>t1_store</id>
  <title>Update Zustand Store for Unread & Position</title>
  <description>Add unread signal tracking and draggable position memory to `useTmaStore`.</description>
  <read_first>
    - src/store/useTmaStore.ts
  </read_first>
  <action>
    Modify `src/store/useTmaStore.ts` to add:
    State:
    - `hasUnreadSignals: boolean`
    - `terminalPosition: { x: number, y: number }`
    Actions:
    - `setHasUnreadSignals: (val: boolean) => void`
    - `setTerminalPosition: (pos: { x: number, y: number }) => void`
    
    Initialize `hasUnreadSignals: false` and `terminalPosition: { x: 0, y: 0 }`.
  </action>
  <acceptance_criteria>
    - `src/store/useTmaStore.ts` contains `hasUnreadSignals` and `terminalPosition`
  </acceptance_criteria>
</task>

<task>
  <id>t2_overlay_aesthetics</id>
  <title>Terminal Aesthetics & Persistence</title>
  <description>Update the NervalisOverlay with draggable persistence and CRT/Glitch effects.</description>
  <depends_on>t1_store</depends_on>
  <read_first>
    - src/features/dashboard/components/NervalisOverlay.tsx
  </read_first>
  <action>
    Modify `src/features/dashboard/components/NervalisOverlay.tsx`:
    1. Import `useTmaStore` to get and set `terminalPosition`.
    2. Add `drag` and `onDragEnd` props to the `<motion.div>` to save coordinates to `setTerminalPosition`.
    3. Add `initial={{ ...terminalPosition }}` instead of `y: 20` resets.
    4. Keep `AnimatePresence` but ensure the position is loaded from the store.
    5. Ensure `opacity-[0.03]` class for `.crt-scanline` has `pointer-events-none`.
    6. Ensure the `hasUnreadSignals` is set to `false` automatically whenever `toggleNervalis` is fired to `true`.
  </action>
  <acceptance_criteria>
    - `NervalisOverlay.tsx` references `setTerminalPosition`.
    - `NervalisOverlay.tsx` references `setHasUnreadSignals`.
  </acceptance_criteria>
</task>

<task>
  <id>t3_triggers</id>
  <title>Global Notification Triggers</title>
  <description>Set the unread flag when new messages or polls arrive while the terminal is closed.</description>
  <depends_on>t1_store</depends_on>
  <read_first>
    - src/features/exploration/components/InsideRoomArena.tsx
    - src/features/dashboard/components/VerticalChatLog.tsx
  </read_first>
  <action>
    1. In `src/features/exploration/components/InsideRoomArena.tsx`, in the `chat_messages` channel subscription, check if `!useTmaStore.getState().isNervalisOpen` and if so, call `useTmaStore.getState().setHasUnreadSignals(true)`.
    2. Do the same in the `privacy_polls` channel subscription.
    3. In `src/features/dashboard/components/VerticalChatLog.tsx`, do the same in its `vertical_chat` channel subscription if `isNervalisOpen` is false.
  </action>
  <acceptance_criteria>
    - `InsideRoomArena.tsx` contains `setHasUnreadSignals(true)`
    - `VerticalChatLog.tsx` contains `setHasUnreadSignals(true)`
  </acceptance_criteria>
</task>

<task>
  <id>t4_hud</id>
  <title>Minimal HUD Notification Indicator</title>
  <description>Create or update the HUD button that opens Nervalis to reflect the unread status.</description>
  <depends_on>t1_store</depends_on>
  <read_first>
    - Ensure you locate where the terminal is opened from (usually a top-level layout or navigation HUD component). Find where `toggleNervalis` is triggered by the user via grep_search.
  </read_first>
  <action>
    1. Find the component that renders the button to open Nervalis (search for `toggleNervalis` in `src/features/dashboard` or `src/app`).
    2. Import `hasUnreadSignals = useTmaStore(state => state.hasUnreadSignals)`.
    3. Add a visual indicator (a red or pulsing dot over the button, e.g., `<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />`) when `hasUnreadSignals` is true.
  </action>
  <acceptance_criteria>
    - The file modifying the open trigger has `hasUnreadSignals` mapped.
  </acceptance_criteria>
</task>

## Verification
- `must_haves`:
  1. Terminal drag position is stored globally.
  2. Incoming chats trigger `hasUnreadSignals` when terminal is closed.
  3. Opening terminal clears the unread flag.
