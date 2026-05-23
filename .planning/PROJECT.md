# Project: TMC - The Research for Hope

Consolidating all investigation, communication, and navigation systems into a unified, high-personality terminal interface while making the codebase safer to evolve, easier to deploy, and easier to reason about.

## Core Value
To centralize the player's agency through a single, persistent "Command Center" that reduces HUD clutter and enhances immersion through deep visual personality and real-time environmental awareness.

## Current State
- **Shipped Version**: v1.0 (Nervalis 2.0 Overhaul)
- **Last Completed Milestone**: v2.1 (Repository & Architecture Improvements)
- **Status**: Planning Milestone v2.2

## Context
A web-based Next.js/React social investigation game set in a high-tech academy. Players explore 3D environments, interact with other students, and solve murders. The "Nervalis" terminal remains the primary interface for system-wide interactions. The active production app lives in `apps/tma-client`, while `tmc-scion` and `tmc-characters-maker` remain workspace-local reference repos that should stay ignored by Git.

## Current Milestone: v2.2 Model addition and beta testing

**Goal:** Integrate high-performance 3D room models (.glb) dynamically bound to Supabase while addressing post-beta game balance and stability.

**Target features:**
- **Carga de Modelos 3D (.glb)**: Reemplazar el cubo genérico de las salas con modelos reales en primera persona cargados de forma dinámica y asíncrona.
- **Base de Datos Dinámica**: Agregar columnas de model_url, model_scale y model_offset_y en tma_rooms con soporte en Supabase.
- **Fallback Seguro**: Si una sala no tiene un modelo cargado en DB, debe mostrar el RoomCube clásico con rejilla sin romper el juego.
- **Ajustes Post-Beta**: Espacio para resolver cualquier bug o desbalance que encuentres hoy en tu testeo de la beta (ej. calibración de IP, tiempos del chat vertical o sigilo).

## Requirements

### Validated
- ✓ **3D Room Engine**: Functional WebGL-based room visor with character and evidence sprites.
- ✓ **Neural Possession**: Admin-tier ability to switch controlled characters.
- ✓ **Basic Stealth**: Stealth entry mechanics and visual filters.
- ✓ **Primary Logs**: Chronological investigation and system logs.
- ✓ **Multi-Environment Chat**: Cross-room communication capabilities.
- ✓ **Nervalis 2.0 Personality**: High-personality visual themes with CRT scanlines and glitch effects. - Phase 1
- ✓ **Evidence Poll Consolidation**: Investigation polls moved to unified EVIDENCE tab. - Phase 01.1
- ✓ **Live-Intel Navigation**: 3D map updated with student presence and privacy status. - Phase 2
- ✓ **Unified Social Migration**: Global and Room-specific chat channels integrated into Nervalis. - Phase 4
- ✓ **Staff Control Tab**: Dedicated "ADMIN" tab for character switching/possession (role-based access). - Phase 3
- ✓ **Personal File**: A "SELF" tab where students can view their own profile and status. - Phase 3
- ✓ **Notification Center**: Minimal HUD indicator that alerts users to pings/events when Nervalis is closed. - Phase 1
- ✓ **System Hardening**: Resolved identity-switching race conditions and poll modal persistence. - Phase 5
- ✓ **Assassination Poll Scoping**: Poll visibility supports roleplayers and non-possessing staff. - Phase 06
- ✓ **Gemini AI Case Builder**: Real AI summaries can be generated from gameplay context. - Phase 07
- ✓ **UI Visibility Rules**: The identity switcher is scoped away from immersive room views. - Phase 06
- ✓ **Beta Stabilization**: Tactical beta-readiness audit and final polish completed. - Phase 08
- ✓ **Repo Operating Model**: Monorepo structure, ignored reference repos, and root script alignment completed. - Milestone v2.1
- ✓ **Architecture Boundary Cleanup**: Domain modularity and shared components boundaries established. - Milestone v2.1
- ✓ **Data Layer Hardening**: Separated Supabase client/server boundaries and removed direct DB coupling. - Milestone v2.1
- ✓ **Deployment & Performance Guardrails**: Validated build system and production performance safety nets. - Milestone v2.1

### Active
- [ ] **GLB-01**: Cargar dinámicamente modelos 3D (.glb) en el visor de exploración en primera persona.
- [ ] **DB-01**: Soporte en base de datos `tma_rooms` con campos `model_url`, `model_scale` y `model_offset_y`.
- [ ] **FALLBACK-01**: Renderizado seguro del cubo tradicional si la sala carece de modelo 3D asignado.
- [ ] **BETA-01**: Implementar parches y calibración de jugabilidad a partir del feedback del beta test.

### Out of Scope
- **Moving `apps/tma-client` to repo root**: Vercel can deploy from a subdirectory, so root flattening is churn without enough benefit.
- **Replacing Supabase or Zustand**: This milestone improves boundaries around the current stack instead of swapping core technology.
- **Cross-app unification with `tmc-scion` or `tmc-characters-maker`**: Those repos stay as reference-only workspace neighbors for now.
- **Large-scale schema redesign**: Database improvements should stay additive and low-risk in this milestone.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Atomic Initialization** | Prevents race conditions during identity switching (Staff/NPC) to ensure correct room relocation. | - Complete |
| **List-based Navigation** | Enhances performance and provides clearer "Live Intel" metadata than the 3D map. | - Complete |
| **Consolidated HUD** | Moving group chats and polls into Nervalis simplifies the main screen and focuses immersion on the terminal. | - Complete |
| **Tab Consolidation** | Renamed POLLS to EVIDENCE to serve as both active poll UI and historical archive. | - Complete |
| **Decoupled Modals** | PrivacyPollModal moved outside Nervalis to allow room-blocking logic to function independently. | - Complete |
| **Keep `apps/tma-client` as the deployable app root** | Vercel monorepo support removes the need for a risky repo-root app migration. | - Locked for v2.1 |
| **Keep reference repos in-workspace but Git-ignored** | They are useful for agent/reference context without belonging to the production deploy surface. | - Locked for v2.1 |
| **Prefer incremental strangler refactors over a big-bang rewrite** | The game has coupled realtime, store, and Supabase flows that need safer seams before deeper restructuring. | - Locked for v2.1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. Project framing drifted? -> Update context and milestone notes

**After each milestone**:
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state and next milestone direction

---
*Last updated: 2026-05-23 after milestone v2.2 initialization*
