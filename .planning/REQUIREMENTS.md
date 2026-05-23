# Requirements: Milestone v2.2 - Model Addition and Beta Testing

## Overview
This milestone integrates dynamic 3D room models (.glb) into the first-person exploration engine, configures a relational schema in Supabase to link models to rooms, establishes robust fallbacks for unmodelled rooms, and resolves gameplay balance issues identified during beta testing.

## Milestone Requirements

### 3D Model Integration
- [ ] **GLB-01**: The exploration engine dynamically loads custom `.glb` / `.gltf` model files in first-person view using React Three Fiber and `@react-three/drei`'s `useGLTF`.
- [ ] **GLB-02**: The 3D visor supports model-specific scale, position, and rotation transformations to fit room boundaries.
- [ ] **GLB-03**: Loaded models support visual enhancement standards including shadow casting, shadow receiving, and roughness adjustments.

### Database & Storage Schema
- [ ] **DB-01**: The `tma_rooms` table includes `model_url`, `model_scale`, and `model_offset_y` database fields.
- [ ] **DB-02**: High-performance hosting for GLB files is configured using local asset boundaries or public Supabase Storage buckets with caching.

### Fallback Engine
- [ ] **FALLBACK-01**: If a room lacks a valid `model_url`, the system safely falls back to the generic grid-helper `RoomCube` without breaking.
- [ ] **FALLBACK-02**: Room changes and realtime events (chat, presence, movement) remain thread-safe and functional across different room models.

### Post-Beta Calibration
- [ ] **BETA-01**: Calibrate investigation point (IP) consumption and recovery based on playtest feedback.
- [ ] **BETA-02**: Improve vertical chat log input sizing and mobile UI scrolling bounds based on user feedback.
- [ ] **BETA-03**: Calibrate stealth roll formulas and systemic notification sounds/visibility.

## Future Requirements
- [ ] **FUT-01**: Implement interactive 3D colliders for custom room models.
- [ ] **FUT-02**: Build a visual dashboard editor for admins to place and scale models directly in-browser.

## Out of Scope
- Swapping the Three.js or React Three Fiber rendering engine.
- Re-architecting core player sync or message pipelines.
- Flat file database migration (Supabase remains the core database).

## Verification Criteria
- [ ] GLB room models load dynamically and display correct proportions and positions.
- [ ] Supabase room columns are fully queryable and bound to state.
- [ ] Falling back to the grid-cube occurs gracefully without UI crashes or blank screens.
- [ ] Post-beta patches are validated through successful playtesting of the chat, IP spending, and stealth.

## Traceability

| Requirement | Phase |
|-------------|-------|
| GLB-01 | Phase 1 |
| GLB-02 | Phase 1 |
| GLB-03 | Phase 1 |
| DB-01 | Phase 2 |
| DB-02 | Phase 2 |
| FALLBACK-01 | Phase 3 |
| FALLBACK-02 | Phase 3 |
| BETA-01 | Phase 4 |
| BETA-02 | Phase 4 |
| BETA-03 | Phase 4 |
