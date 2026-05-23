# Roadmap: Milestone v2.2 - Model Addition and Beta Testing

## Overview
This roadmap outlines a 4-phase execution plan to transition the social investigation platform from abstract box arenas (`RoomCube`) to high-immersion 3D environments, including database schema extensions, safety fallbacks, and balance patches from today's beta test.

## Proposed Roadmap

**4 phases** | **10 requirements mapped** | All milestone requirements covered

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Dynamic 3D Model Visor | Load custom GLB/GLTF room models inside the exploration visor. | GLB-01, GLB-02, GLB-03 | 3 |
| 2 | Relational Schema & Storage | Configure database columns and establish secure static/cloud asset storage. | DB-01, DB-02 | 2 |
| 3 | Fallback Engine Integration | Build robust rendering and event boundaries for unmodelled room transitions. | FALLBACK-01, FALLBACK-02 | 2 |
| 4 | Post-Beta Calibration | Implement gameplay adjustments and mobile UI polish from the beta playtest. | BETA-01, BETA-02, BETA-03 | 3 |

---

## Phase 1: Dynamic 3D Model Visor
**Goal:** Enable dynamic rendering of custom GLB models in the first-person view.

**Requirements:** `GLB-01`, `GLB-02`, `GLB-03`

**Success criteria:**
1. The exploration engine dynamically imports `.glb` / `.gltf` model files using React Three Fiber's `useGLTF`.
2. Loaded 3D models support specific scale, position, and rotation configurations per room.
3. 3D models successfully receive and cast shadows, applying customized material roughness settings.

---

## Phase 2: Relational Schema & Storage
**Goal:** Extend the database schema and storage assets to support room models.

**Requirements:** `DB-01`, `DB-02`

**Success criteria:**
1. The `tma_rooms` table contains queryable fields `model_url`, `model_scale`, and `model_offset_y` synced in real-time.
2. GLB assets are successfully fetched from optimized static folders or public Supabase Storage buckets.

---

## Phase 3: Fallback Engine Integration
**Goal:** Secure robust room-changing behavior and visual boundaries.

**Requirements:** `FALLBACK-01`, `FALLBACK-02`

**Success criteria:**
1. Visor gracefully falls back to the generic wireframe `RoomCube` if `model_url` is absent.
2. Room switching and realtime events function flawlessly across dynamic model and grid boundaries.

---

## Phase 4: Post-Beta Calibration
**Goal:** Address balance, gameplay, and mobile UI adjustments from today's beta test.

**Requirements:** `BETA-01`, `BETA-02`, `BETA-03`

**Success criteria:**
1. IP cost structures and restoration rates are tweaked to optimal gameplay flow.
2. Sizing and bounds of the vertical chat inputs are polished for mobile viewports.
3. Stealth roll ratios and notification alert audios are verified as highly functional.

---

## Sequencing Notes
- Develop Phase 1 using public sandbox assets (`/public/models/`) first.
- Apply database migrations in Phase 2 only after testing model compatibility.
- Ensure strict error handling in Phase 3 so missing assets never cause visual novel or chat loop freezes.
