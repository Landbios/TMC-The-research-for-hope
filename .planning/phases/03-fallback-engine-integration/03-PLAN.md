---
plan_id: 03-fallback-engine
objective: Implement React ErrorBoundary for models, CRT transition overlay, atomic Supabase channel cleanup, and camera resets.
wave: 1
depends_on: []
files_modified:
  - src/features/exploration/components/InsideRoomArena.tsx
  - src/features/exploration/components/RoomCube.tsx
autonomous: true
requirements_addressed: [FALLBACK-01, FALLBACK-02]
---

# Plan 03-fallback-engine

## Tasks

### 1. Atomic Supabase Channel Cleanup
<action>
Modify `src/features/exploration/components/InsideRoomArena.tsx`.
In the `useEffect` hook that handles Supabase subscriptions, create an array of active channels: `const activeChannels: ReturnType<typeof supabase.channel>[] = []`.
Push all created channels (`presenceChannel`, `chatChannel`, `evidenceChannel`, etc.) into this array.
In the `cleanup` return function of the `useEffect`, iterate over `activeChannels` and call `supabase.removeChannel(ch)` for each channel synchronously, ensuring no memory leaks occur between room transitions. Remove the individual `supabase.removeChannel(xxx)` calls.
</action>
<read_first>
- src/features/exploration/components/InsideRoomArena.tsx
</read_first>
<acceptance_criteria>
- `InsideRoomArena.tsx` contains an array `activeChannels` to store channels in the effect.
- `InsideRoomArena.tsx` calls `supabase.removeChannel(ch)` in a loop for all active channels in the cleanup function.
</acceptance_criteria>

### 2. CRT Transition Overlay
<action>
Modify `src/features/exploration/components/InsideRoomArena.tsx`.
Import `AnimatePresence` and `motion` from `framer-motion`.
Create a state `isTransitioning` (boolean) that triggers when the room changes (when `roomId` changes, set to `true`, then `false` after a 1.5s timeout).
Add a full-screen transition overlay using `<AnimatePresence>` and `motion.div` with a fade-out effect that displays the text `[CONECTANDO BIOMETRÍA SECTORIAL... ESTABLECIENDO PROTOCOLO DE EXPLORACIÓN]`. Apply CRT/Scanline CSS utility classes to this overlay to match the theme. Place this overlay above the Canvas (using z-index absolute positioning).
</action>
<read_first>
- src/features/exploration/components/InsideRoomArena.tsx
- src/features/exploration/components/AcademyMap.tsx
</read_first>
<acceptance_criteria>
- `InsideRoomArena.tsx` imports `AnimatePresence` and `motion` from `framer-motion`.
- The transition overlay displays the text `[CONECTANDO BIOMETRÍA SECTORIAL... ESTABLECIENDO PROTOCOLO DE EXPLORACIÓN]`.
- The overlay triggers on `roomId` change.
</acceptance_criteria>

### 3. RoomModel Error Boundary
<action>
Create a `RoomModelErrorBoundary` class component inside `src/features/exploration/components/RoomCube.tsx`.
The Error Boundary should catch errors (`componentDidCatch`, `getDerivedStateFromError`).
If `hasError` is true, the Error Boundary should render the classic grid fallback: `<gridHelper args={[10, 10, 0x444444, 0x222222]} />` and a basic floor mesh instead of the `RoomModel`.
Wrap the dynamic `<RoomModel />` component with `<RoomModelErrorBoundary>`.
</action>
<read_first>
- src/features/exploration/components/RoomCube.tsx
</read_first>
<acceptance_criteria>
- `RoomCube.tsx` contains a React Error Boundary class.
- The `<RoomModel />` is wrapped by the Error Boundary.
- When the Error Boundary catches an error, it renders a fallback 3D grid (`<gridHelper>`).
</acceptance_criteria>

### 4. Camera Reset on Room Change
<action>
Modify `src/features/exploration/components/InsideRoomArena.tsx` (or where `OrbitControls` is used).
Create a helper component `<CameraResetter roomId={room.id} />` inside the `<Canvas>`.
Inside this component, use `useThree()` to get `camera` and `controls`.
Add a `useEffect` that listens to `roomId`. When `roomId` changes, set `camera.position.set(0, 1.5, 0.1)`, `camera.rotation.set(0, 0, 0)`, and if `controls` exists, set `controls.target.set(0, 1.5, 0)` and call `controls.update()`.
Render this `<CameraResetter>` component inside the Canvas.
</action>
<read_first>
- src/features/exploration/components/InsideRoomArena.tsx
</read_first>
<acceptance_criteria>
- A camera reset mechanism exists that listens to `roomId`.
- Camera position is reset to `[0, 1.5, 0.1]` and target to `[0, 1.5, 0]` on room change.
</acceptance_criteria>

## Verification
<must_haves>
<truths>
- Room switching must properly disconnect from old Supabase channels and connect to new ones.
- Failing to load a 3D model must not crash the Canvas, but instead render a fallback grid.
- Camera orientation must be identical at the start of every room.
</truths>
</must_haves>
