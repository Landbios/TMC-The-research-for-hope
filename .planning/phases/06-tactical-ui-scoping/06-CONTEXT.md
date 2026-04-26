# Phase 06: Tactical UI Scoping - Context

## Goal
To refine the visibility of specialized Staff tools and the Assassination Poll to ensure immersive roleplay while maintaining administrative functionality.

## Requirements
1.  **Assassination Poll Visibility**:
    - Roleplayers: Always see the poll.
    - Staff (Non-possessing): See the poll (so they can participate as their base character).
    - Staff (Possessing NPC): Hide the poll.
2.  **Identity Switcher Scoping**:
    - Map/Dashboard: Visible for Staff.
    - Rooms (`/rooms/[roomId]`): Hidden for everyone.

## Current State
- `GlobalPollOverlay.tsx` uses a hardcoded `userRole === 'roleplayer'` check for the assassination poll.
- `GlobalTmaRegistry.tsx` renders `StaffIdentitySwitcher` globally for anyone with the staff role.
- `useTmaStore.ts` tracks `myCharacterId` and `originalCharacter`, allowing us to detect possession status.

## Files of Interest
- [GlobalPollOverlay.tsx](file:///c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/dashboard/components/GlobalPollOverlay.tsx)
- [GlobalTmaRegistry.tsx](file:///c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/components/GlobalTmaRegistry.tsx)
- [useTmaStore.ts](file:///c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/store/useTmaStore.ts)
- [StaffIdentitySwitcher.tsx](file:///c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/apps/tma-client/src/features/admin/components/StaffIdentitySwitcher.tsx)
