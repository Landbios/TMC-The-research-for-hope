# Phase 1: Terminal Polish & Global Notifications - Technical Research

## 1. Architectural Approach

### 1.1 Terminal Persistence (Draggable window)
- **Current State:** `NervalisOverlay.tsx` uses `framer-motion` for drag, but the position resets when toggled off because it's conditionally rendered `if (!isOpen) return null;` or the `AnimatePresence` unmounts the component completely.
- **Solution:** Instead of unmounting the terminal, we should keep it mounted but visually hidden (e.g., `pointer-events-none opacity-0` or `display: none` after exit animation) OR save the `x` and `y` drag coordinates to the `useTmaStore`.
- **Recommendation:** Saving to Zustand (`terminalPosition: { x: number, y: number }`) and binding it to Framer Motion's `dragElastic` or initial state is the cleanest React way, allowing us to keep `AnimatePresence` for the smooth entry/exit.

### 1.2 "Minimal HUD" Notification System
- **Current State:** Messages come through Supabase real-time channels inside `InsideRoomArena.tsx` and `VerticalChatLog.tsx`. If the terminal (Nervalis) is closed, players can't see arriving messages easily.
- **Solution:** Add a lightweight unread counter or pulsing icon to the main HUD (perhaps attached to the Nervalis toggle button).
- **Store Updates:** `useTmaStore` needs a new property: `unreadNotifications: number` or `hasUnread: boolean`. When a new message or poll event arrives and `isNervalisOpen` is false, set this to true. When opened, reset to false.

### 1.3 CRT & Glitch Aesthetics
- **CSS Techniques:**
  - **CRT Scanlines:** A repeating linear-gradient background over the terminal component with `mix-blend-mode: overlay` and low opacity.
  - **Screen Curvature:** Subtle `box-shadow` inset combined with rounded corners (`rounded-xl` or similar).
  - **Glitch Entry:** Framer motion keyframes mapping `opacity`, `scaleY`, and `skewX` for a rapid, split-second load animation (e.g., `[0, 1.2, 0.9, 1]`).

## 2. Dependencies & Files
No new dependencies needed. `framer-motion`, `zustand`, `lucide-react`, and Tailwind are more than sufficient.
- files to touch: 
  - `src/store/useTmaStore.ts` (state for persistence and unread)
  - `src/features/dashboard/components/NervalisOverlay.tsx` (aesthetics, draggable persistence)
  - `src/features/dashboard/components/VerticalChatLog.tsx` or `InsideRoomArena.tsx` (trigger logic for unread state)

## 3. Potential Pitfalls
1. **Z-Index Conflicts:** The CRT scanlines over the terminal MUST have `pointer-events-none`, otherwise users won't be able to click tabs or buttons.
2. **Drag Coordinate Bugs:** If a user drags the terminal off-screen on a large monitor and resizes to mobile, it might get lost.
   - **Mitigation:** Use `dragConstraints` bound to the window size, or automatically reset coordinates to `{x:0, y:0}` if window resize detected.

## 4. Validation Architecture
- **Terminal Polish:** Validate that the drag coordinates remain the same before closing and after reopening.
- **Notifications:** Validate that `useTmaStore.getState().hasUnread` turns true when a message comes in while `isNervalisOpen === false`.
