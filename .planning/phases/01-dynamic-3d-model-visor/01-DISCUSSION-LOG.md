# Phase 1: Dynamic 3D Model Visor - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 01-Dynamic 3D Model Visor
**Areas discussed:** Origen de los Modelos GLB, Navegación y Cámara, Iluminación de Salas, Ubicación de Pistas

---

## Origen y Alojamiento de Modelos GLB

| Option | Description | Selected |
|--------|-------------|----------|
| A) Alojamiento Estático Local | Guardar los modelos en `/public/models/` de Next.js. | ✓ |
| B) Enlaces Dinámicos en Supabase | Cargar URLs desde la tabla de salas en Supabase. | |
| C) Híbrido | Cargar localmente por defecto y dar soporte dinámico. | |

**User's choice:** Opción A (Alojamiento estático local en `/public/models`).
**Notes:** El usuario prefirió esta opción por ahora para evitar latencias de red y facilitar el desarrollo rápido durante el beta test de hoy.

---

## Navegación y Cámara (OrbitControls Limits)

| Option | Description | Selected |
|--------|-------------|----------|
| A) Primera Persona Estricta (Look-Around) | Fijar target de cámara OrbitControls, deshabilitar zoom/pan, libre paneo/inclinación. | ✓ |
| B) Órbita Acotada | Restringir minDistance/maxDistance y maxPolarAngle. | |
| C) Control Libre con Rejilla | Mantener OrbitControls libre y configurar cajas de colisión. | |

**User's choice:** Opción A (Primera Persona Estricta / Look-Around).
**Notes:** El usuario solicitó además que la ubicación de los sprites de otros jugadores se randomice, asegurando geométricamente que no bloqueen visualmente la selección de las pistas activas en el cuarto.

---

## Iluminación y Sombras

| Option | Description | Selected |
|--------|-------------|----------|
| A) Iluminación Dinámica Genérica | Luz ambiental y de punto central, controladas por estado reactivo de ciclo día/noche. | ✓ |
| B) Iluminación Integrada en GLB | Importar y usar luces internas embebidas en el modelo GLB. | |
| C) Sombras de Alta Fidelidad | Activar castShadow/receiveShadow de alta fidelidad en toda la geometría. | |

**User's choice:** Opción A (Iluminación Dinámica Genérica).
**Notes:** La iluminación cambiará automáticamente y de forma reactiva al implementarse los ciclos día/noche en el juego.

---

## Ubicación y Clic de Pistas

| Option | Description | Selected |
|--------|-------------|----------|
| A) Coordenadas Absolutas | overlays flotantes usando el actual `EvidenceSprite3D` en base a coordenadas absolutas. | ✓ |
| B) Raycasting e Inspección Directa | Clic directo sobre la geometría 3D del escenario. | |

**User's choice:** Opción A (Coordenadas Absolutas en base de datos).
**Notes:** Mantiene compatibilidad directa con el panel de administración y base de datos actuales de evidencias.

---

## the agent's Discretion

- Diseño del componente y spinner de carga asíncrona.
- Algoritmo matemático para distribuir de forma aleatoria los avatares sin chocar con las coordenadas absolutas de las pistas.

## Deferred Ideas

- Colisionadores físicos y raycasting directo en la malla del modelo GLB.
- Diseñar un cargador y visor de escala interactivo para el panel de administración.
