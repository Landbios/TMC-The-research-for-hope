# Phase 4: Post-Beta Calibration - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

The user elected to pivot Phase 4 away from IP costs, mobile UI, and stealth calibration. Instead, Phase 4 will exclusively focus on resolving a critical geometric bug introduced in Phase 1: players are occasionally spawning beneath the floor of the loaded `glb` room models. The scope is to dynamically compute the floor/bounding box of the loaded 3D scene and pass that data upward to define the player/camera's safe starting altitude, preventing out-of-bounds spawning.

</domain>

<decisions>
## Implementation Decisions

### Dynamic Player Spawning (Pivot)
- **D-01:** Instead of hardcoding the camera Y-coordinate to 1.5 uniformly, the `RoomModel` component (or a similar module) will compute the bounding box (`THREE.Box3`) of the loaded `.glb` scene. 
- **D-02:** The system will extract the floor boundary (likely `box.min.y`) and dynamically adjust the camera's spawn position (or the model's Y offset) to ensure the player spawns securely above the model's floor level.
- **D-03:** The original BETA-01, BETA-02, and BETA-03 requirements are temporarily deferred to a future phase or sub-phase, as ensuring basic navigational geometry takes precedence.

### the agent's Discretion
- Exactly how the computed boundary is passed back to `CameraResetter` (e.g. via a zustand store, React context, or a local callback passed to `<RoomModel>`).
- If the model is completely offset to center around 0 on the Y axis, or if the camera's start coordinate is simply shifted upward. 

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Exploration Components
- `src/features/exploration/components/RoomModel.tsx` — Where the GLTF scene is loaded and where the bounding box calculation will logically occur.
- `src/features/exploration/components/InsideRoomArena.tsx` — Where the `<CameraResetter>` is defined, which currently hardcodes `camera.position.set(0, 1.5, 0.1)`.

</canonical_refs>

<specifics>
## Specific Ideas

- "can we make a function in the module where whe clues are placed and moves to define the player starting position or the floor and walls or center of the model?"
- The `Box3` helper in ThreeJS is ideal for determining the precise `min`, `max`, and `center` of loaded raw meshes.

</specifics>

<deferred>
## Deferred Ideas

- BETA-01: Calibrate IP consumption
- BETA-02: Fix vertical chat bounds for mobile
- BETA-03: Stealth formulas and audio calibration
*(All deferred at user's explicit request to prioritize the falling-through-floor bug)*

</deferred>

---

*Phase: 04-post-beta-calibration*
*Context gathered: 2026-05-23*
