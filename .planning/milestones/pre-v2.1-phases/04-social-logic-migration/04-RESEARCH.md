# Phase 4: Social & Logic Migration - Technical Research

## 1. Architectural Approach

### 1.1 The SELF Component
- **Current State:** A user has no centralized place to view their own `character` sheet, see their current IP (Investigation Points), or their Title.
- **Solution:** Introduce a `SELF` tab into `NervalisOverlay.tsx`. It will pull directly from `useTmaStore(state => state.originalCharacter)`. 

### 1.2 Group Chat Migration
- **Current State:** Group chat logic or `VNChatOverlay` handles social interactions. The terminal currently has a generic `CHAT` tab which uses `VerticalChatLog.tsx`. Let's ensure this `VerticalChatLog.tsx` gracefully supports the group chat structures, letting users talk through the Nervalis terminal natively rather than a split UI.

### 1.3 Evidence / Privacy Poll Integration
- **Current State:** `PrivacyPollModal` and similar evidence structures render in `InsideRoomArena.tsx` as floating HTML modals.
- **Problem:** They disrupt the HUD experience.
- **Solution:** Move the Active Polls into the Nervalis terminal list. We will add a `POLLS` tab or render them prominently at the top of the `CHAT` or `SELF` screen. Given the requirements suggest a "POLLS or SYS" tab, we will implement an `EVENT` or `POLLS` tab that flashes when an active poll arrives in the room.

## 2. Dependencies & Files
 - `NervalisOverlay.tsx`: We will add new tabs (`SELF` and `POLLS`).
 - `InsideRoomArena.tsx`: Delete or hide the `PrivacyPollModal` and instead hook its logic into the global Zustand store so Nervalis can read real-time polls.

## 3. Potential Pitfalls
- Moving the Privacy Poll logic entirely into Nervalis means users MUST open Nervalis to vote. This is intended by to satisfy the 'Command Center' premise, but we must ensure `hasUnreadSignals` accurately flags the terminal when a poll starts! (Already done in Phase 1).
