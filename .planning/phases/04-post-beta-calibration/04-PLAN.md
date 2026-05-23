---
plan_id: 04-dynamic-floor
objective: Dynamically compute the bounding box of GLB models to align their floors to Y=0, ensuring safe player spawn coordinates.
wave: 1
depends_on: []
files_modified:
  - src/features/exploration/components/RoomModel.tsx
autonomous: true
requirements_addressed: []
---

# Plan 04-dynamic-floor

## Tasks

### 1. Dynamic Floor Alignment
<action>
Modify `src/features/exploration/components/RoomModel.tsx`.
Add a `useState` hook to store a local offset: `const [localOffset, setLocalOffset] = useState<[number, number, number]>([0, 0, 0]);`.
Inside the existing `useEffect` that processes `scene` (which sets up shadows), compute the bounding box of the unscaled scene:
```typescript
const box = new THREE.Box3().setFromObject(scene);
// box.min.y is the lowest point of the geometry (the floor)
const lowestY = box.min.y;
// If the lowest point is not Infinity, offset the scene so the floor is at Y=0
if (lowestY !== Infinity && lowestY !== -Infinity) {
  setLocalOffset([0, -lowestY, 0]);
}
```
Update the `return` statement: Wrap the `<primitive object={scene}>` inside a `<group position={position} scale={scale} rotation={rotation}>`.
Remove `position`, `scale`, and `rotation` props from the `<primitive>` itself.
Pass `position={localOffset}` to the `<primitive>` so it shifts the model locally.
</action>
<read_first>
- src/features/exploration/components/RoomModel.tsx
</read_first>
<acceptance_criteria>
- `RoomModel.tsx` imports `useState` and computes `new THREE.Box3().setFromObject(scene)`.
- The `<primitive>` is wrapped in a `<group>` that applies the external transform props.
- The `<primitive>` uses `position={localOffset}` to shift the mesh so its floor rests at Y=0.
</acceptance_criteria>

## Verification
<must_haves>
<truths>
- GLB models with arbitrary origins must automatically align their absolute lowest geometry point to Y=0.
- The `CameraResetter` at Y=1.5 will therefore consistently spawn the player 1.5 units above the model's floor without requiring manual per-room Y offsets in the database.
</truths>
</must_haves>
