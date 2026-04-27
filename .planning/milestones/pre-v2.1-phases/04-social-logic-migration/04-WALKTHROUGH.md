# Phase 04: Multi-Channel Chat Integration - Walkthrough

The Nervalis terminal now supports dynamic switching between Global and Local room communication channels.

## Changes Made

### 1. Multi-Channel Chat (VerticalChatLog.tsx)
- **Channel Selector**: Added a themed UI at the top of the CHAT tab to toggle between `[RED_GLOBAL]` and `[SECTOR_LOCAL]`.
- **Dynamic Logic**: Switching channels automatically re-subscribes to the corresponding Supabase channel.
- **Room Awareness**: The `LOCAL` channel automatically tracks the player's `selectedRoomId` from the store.
- **Visual Distinction**:
  - **Global**: Blue/Cyan themed message bubbles and indicators.
  - **Local**: Green/Emerald themed message bubbles and labels (`SECTOR_LINK`).
- **Input Context**: The placeholder and footer labels update dynamically to show exactly where the transmission is being sent.

## Verification Results

### Automated Tests
- `npm run build`: **PASSED** (0 errors)

### Manual Verification
- Verified that switching to `LOCAL` shows messages only for the current room.
- Verified that switching to `GLOBAL` restores the academy-wide chat history.
- Verified that message bubbles change color based on the active channel.
