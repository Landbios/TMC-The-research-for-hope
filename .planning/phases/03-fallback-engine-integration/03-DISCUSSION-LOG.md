# Phase 3: Fallback Engine Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 3-Fallback Engine Integration
**Areas discussed:** Tolerancia a Errores de useGLTF, UI de Transición Inmersiva, Desconexión y Saneamiento de Canales de Supabase, Orientación y Reset de la Cámara

---

## 1. ¿Cómo prefieres que gestionemos las excepciones de useGLTF (ej: modelos corruptos o enlaces rotos) para evitar pantallas en blanco?

| Option | Description | Selected |
|--------|-------------|----------|
| Envolver el cargador del modelo en un React ErrorBoundary dentro de RoomCube | Si falla useGLTF, se degrada automáticamente a la rejilla 3D clásica | ✓ |
| Realizar un fetch HEAD de verificación HTTP de red antes de alimentar a useGLTF | Añade una petición extra antes de renderizar | |

**User's choice:** Envolver el cargador del modelo en un React ErrorBoundary dentro de RoomCube
**Notes:** Decisión de ingeniería altamente resiliente y nativa de React, evitando llamadas de red innecesarias y manteniendo el render de las salas robusto.

---

## 2. Al cambiar de sala, el descifrado 3D puede causar un congelamiento leve de fotogramas. ¿Qué efecto visual prefieres para tapar la latencia?

| Option | Description | Selected |
|--------|-------------|----------|
| Filtro de interferencia CRT animado ("CONECTANDO BIOMETRÍA...") | Framer Motion AnimatePresence, temático y fluido | ✓ |
| Un spinner de carga tradicional estático o de alambre | Spinner simple no temático | |

**User's choice:** Filtro de interferencia CRT animado ("CONECTANDO BIOMETRÍA...") con AnimatePresence de Framer Motion
**Notes:** Ofrece una transición de alta inmersión adaptada a la estética retro-futurista de la academia.

---

## 3. ¿ de qué forma prefieres que aseguremos el desmontaje seguro de los canales de chat y presencia en Supabase al cambiar de sala?

| Option | Description | Selected |
|--------|-------------|----------|
| Array unificado de cleanup atómico en la función de retorno del useEffect de InsideRoomArena | Desconexión inmediata de los 5 canales | ✓ |
| Delegar la desconexión al recolector de basura de Supabase Realtime | Solución automática sin cleanup estricto | |

**User's choice:** Array unificado de cleanup atómico en la función de retorno del useEffect de InsideRoomArena, asegurando la desconexión de los 5 canales de Supabase de inmediato
**Notes:** Evita colisiones de eventos de salas anteriores y fugas de memoria residuales.

---

## 4. ¿Cuál debe ser el comportamiento de orientación de la cámara (paneo/rotación) al hacer un tránsito entre salas?

| Option | Description | Selected |
|--------|-------------|----------|
| Reset automático de OrbitControls a la vista de frente neutra [0, 1.5, 0.1] | El usuario ve la perspectiva idónea inicial | ✓ |
| Mantener el ángulo de paneo/rotación actual | Conserva el ángulo anterior al entrar a la nueva | |

**User's choice:** Reset automático de OrbitControls a la vista de frente neutra [0, 1.5, 0.1]
**Notes:** Asegura que la composición visual de entrada de cada cuarto se aprecie como el autor de la habitación la diseñó.

---

## the agent's Discretion

- Diseño exacto del overlay y velocidad del desvanecimiento en Framer Motion.
- Clases de CSS de utilidad animadas para el efecto scanline.

---

## Deferred Ideas

- None — la robustez del tránsito sectorial fue resuelta en su totalidad.
