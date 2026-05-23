---
phase: 1
slug: dynamic-3d-model-visor
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-23
---

# Phase 1 — UI Design Contract: Dynamic 3D Model Visor

> Visual and interaction contract for the first-person GLB 3D Room Visor.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (custom CSS/Tailwind) |
| Preset | cyber-terminal / CRT scanlines |
| Component library | none (vanilla Tailwind) |
| Icon library | Lucide React |
| Font | Monospace (`var(--font-mono)`) / Serif (`var(--font-cinzel)`) |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Pistas icon gap |
| sm | 8px | CCTV title padding |
| md | 16px | Visor buttons padding |
| lg | 24px | Dynamic room details box |
| xl | 32px | Margin from screen borders |
| 2xl | 48px | Visor header spacing |
| 3xl | 64px | Main 3D Canvas borders |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | Normal (400) | 1.5 |
| Label | 10px | Bold (700) | 1.2 |
| Heading | 20px | Extrabold (800) | 1.3 |
| Display | 28px | Black (900) | 1.1 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#000000` | 3D Canvas environment base background |
| Secondary (30%) | `#0a0a0a` | Control overlay blocks, look-around HUD |
| Accent (10%) | `#3b82f6` (blue) | Neon terminal borders, glowing HUD widgets |
| Destructive | `#ef4444` (red) | Threat alerts and crime scene boundary markings |

Accent reserved for: Visor border glow, look-around lock indicators, and dynamic clue discovery highlights.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `INSPECCIONAR PISTA` |
| Empty state heading | `ÁREA EN DETECCIÓN ASÍNCRONA...` |
| Empty state body | `El modelo tridimensional está inicializando sus matrices. Por favor, mantenga estable el enlace neuronal.` |
| Error state | `ENLACE ROTO: Falla de inicialización de mallas. Reintentando sintonía...` |
| Destructive confirmation | `SALIR DE LA ZONA: ¿Confirmar retirada del sector táctico?` |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-23
