# Phase 2: Live-Intel Room Navigation - Technical Research

## 1. Architectural Approach

### 1.1 Replacing the 3D AcademyMap
- **Current State:** `AcademyMap.tsx` uses `@react-three/fiber` to render a 3D isometric view of rooms.
- **Problem:** It's performance-heavy inside the Nervalis terminal, and it doesn't easily show detailed per-room data (like which specific students are inside).
- **Solution:** We will refactor `AcademyMap.tsx` to return a DOM-based interface (a list or grid of styling panels) instead of a 3D `<Canvas>`. This aligns with the "Terminal" aesthetic.

### 1.2 Real-Time Global Presence
- **Current State:** `InsideRoomArena.tsx` subscribes to characters *only in the current room*.
- **Solution:** `AcademyMap.tsx` needs a global real-time subscription.
  1. Fetch all rooms (`tma_rooms`).
  2. Fetch all characters (`tma_characters`).
  3. Map characters to rooms using `current_room_id`.
  4. Subscribe to `tma_characters` and `tma_rooms` globally to update the state immediately when a student moves or a room's privacy changes.

### 1.3 Room Navigation Action
- **Current State:** The 3D map handles clicking a node, which updates `selectedRoomId`, but actually *moving* involves `router.push('/rooms/[id]')`. Wait, `AcademyMap` only sets `selectedRoomId`, and inside `AcademyMap`'s parent, the user is navigated? No, `RoomNode.tsx` has `useRouter().push('/rooms/' + id)` or something similar.
- **Solution:** In the new List-based `AcademyMap`, clicking a room will trigger `router.push('/rooms/' + room.id)`. AND it should auto-close the terminal (`toggleNervalis(false)`).

## 2. Dependencies & Files
- Modify `src/features/exploration/components/AcademyMap.tsx` to become a 2D DOM component.
- Remove `RoomNode.tsx` and `CameraController.tsx` if they become unused.

## 3. Potential Pitfalls
- **Over-rendering:** A global subscription to `tma_characters` might trigger many re-renders.
  - **Mitigation:** Use a localized state inside `AcademyMap` that groups characters by room ID, avoiding global state ping-pong unless necessary.
- **Memory Leaks:** Ensure the global subscription channel is properly removed in the `useEffect` cleanup.
