# Phase 1: Dynamic 3D Model Visor - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Carga y renderizado interactivo de modelos tridimensionales (`.glb`) en primera persona dentro del visor de exploración de la academia (`InsideRoomArena`), reemplazando el cubo clásico estático (`RoomCube`). Los avatares de otros jugadores y las evidencias flotantes deben integrarse dentro del nuevo entorno.

</domain>

<decisions>
## Implementation Decisions

### Origen y Alojamiento de Modelos 3D
- **D-01:** Los modelos `.glb` se alojarán local y estáticamente en la carpeta pública del cliente (`apps/tma-client/public/models/`). Esto evita latencias de red y simplifica las transferencias de archivos de modelos durante el desarrollo inicial y el beta test de hoy.

### Navegación y Límites de la Cámara
- **D-02:** Se establece un modo de primera persona estricto ("Look-Around"). El centro del target de OrbitControls queda bloqueado en la posición de visualización del jugador `[0, 1.5, 0]`. Se deshabilita por completo el zoom y el desplazamiento lateral (pan/zoom = false). El jugador solo tiene libertad para rotar la vista (paneo y cabeceo) para mirar alrededor del cuarto tridimensional cerrado sin poder salir de los límites de las paredes.

### Distribución de Jugadores en Escena
- **D-03:** Los avatares bidimensionales de los demás jugadores presentes en la sala (`CharacterSprite3D`) se distribuirán en posiciones aleatorias controladas dentro del cuarto en cada visualización de jugador.
- **D-04:** El algoritmo de posicionamiento de avatares debe validar geométricamente que ningún sprite de jugador se dibuje bloqueando visualmente las coordenadas activas de las pistas (`EvidenceSprite3D`), asegurando que la recolección de evidencia siempre sea accesible.

### Iluminación del Escenario
- **D-05:** Se implementará iluminación dinámica genérica del lado del cliente (luz ambiental y luz de punto central). Los parámetros de color y de intensidad lumínica serán reactivos, preparándose para cambiar de forma dinámica en sincronía con los estados de los ciclos de día y noche del juego.

### Ubicación e Interacción de Pistas
- **D-06:** Se conservará el sistema de coordenadas absolutas en base de datos. Las pistas y hallazgos continuarán dibujándose como overlays flotantes (`EvidenceSprite3D`) en coordenadas fijas del espacio tridimensional absoluto, sin necesidad de interactuar con colisionadores internos del modelo GLB.

### the agent's Discretion
- El algoritmo matemático exacto para evitar colisiones y superposiciones visuales entre avatares y pistas.
- La intensidad por defecto y tonalidad de color de la luz del punto central.
- El diseño visual del spinner o caja de carga mientras el modelo `.glb` es decodificado asíncronamente por `useGLTF`.

</decisions>

<specifics>
## Specific Ideas

- "Look-around simula estar físicamente dentro del cuarto cerrado, impidiendo que el usuario vea por fuera de los límites de las paredes."
- "Los sprites de otros jugadores se ubicarán en posiciones aleatorias controladas, evitando tapar las evidencias de la habitación."

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 3D Visor components
- `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx` — El visor de exploración interactivo principal 3D donde se conectarán los modelos y la cámara look-around.
- `apps/tma-client/src/features/exploration/components/RoomCube.tsx` — El renderizador actual de fondo de sala que será modificado.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CharacterSprite3D` — Componente R3F existente para pintar el sprite 2D de otros jugadores en la sala.
- `EvidenceSprite3D` — Componente R3F existente para pintar la evidencia flotante.

### Established Patterns
- Pistas dinámicas asíncronas: Suscripción en Supabase Realtime a pistas de la sala activa para actualizar el estado del visor de inmediato al crearse o borrarse evidencias.

### Integration Points
- `InsideRoomArena.tsx` — Reemplazo del componente `<RoomCube />` por la carga asíncrona mediante un Suspense Boundary.

</code_context>

<deferred>
## Deferred Ideas

- Colisionadores físicos interactivos dentro del modelo GLB — Fase Futura.
- Creador y escalador de modelos visual en la web para el Admin — Backlog.

</deferred>

---

*Phase: 01-dynamic-3d-model-visor*
*Context gathered: 2026-05-23*
