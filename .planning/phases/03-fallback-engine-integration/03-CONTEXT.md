# Phase 3: Fallback Engine Integration - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Garantizar la estabilidad visual y la robustez del motor durante los tránsitos rápidos de salas. Esto abarca: la degradación fluida mediante ErrorBoundaries de React ante fallos de carga en `useGLTF`, la visualización de overlays temáticos CRT de carga ("CONECTANDO BIOMETRÍA...") para enmascarar tirones de GPU, la desconexión síncrona y atómica de los 5 canales activos de Supabase al cambiar de sector para prevenir fugas de memoria, y el restablecimiento automático de la orientación de cámara a un punto de vista neutro de frente.

</domain>

<decisions>
## Implementation Decisions

### Tolerancia a Errores de useGLTF
- **D-01:** Se implementará un componente `RoomModelErrorBoundary` (clase React) dentro del visor de exploración. Si `useGLTF` falla en cargar un archivo `.glb` (por un error 404, archivo corrupto o latencia de red rota), el error será interceptado y la vista se degradará de inmediato a renderizar la rejilla 3D clásica con textura de fallback, asegurando que la VN y el chat grupal sigan funcionando a la perfección.

### UI de Transición Inmersiva
- **D-02:** Durante el desmontaje y montaje de Canvas tridimensionales pesados al cambiar de sala, se desplegará una pantalla de transición fluida con Framer Motion. El overlay mostrará una interferencia CRT temática animada que reza: `[CONECTANDO BIOMETRÍA SECTORIAL: ESPERE...]`, tapando visualmente la compilación de shaders 3D y el parpadeo de texturas.

### Desconexión y Saneamiento de Canales de Supabase
- **D-03:** En la función de limpieza (`cleanup`) del Hook de suscripciones de `InsideRoomArena.tsx`, se gestionará la recolección y remoción atómica de todos los canales activos. Se almacenarán en una estructura unificada y se llamará sincrónicamente a `supabase.removeChannel(ch)` por cada elemento, impidiendo fugas de memoria y eliminando cruces de mensajes o actualizaciones biométricas residuales de la sala anterior.

### Orientación y Reset de la Cámara
- **D-04:** En cada cambio de sala, OrbitControls y la cámara del Canvas se restablecerán a la orientación inicial neutra de frente: cámara centrada en `[0, 1.5, 0.1]` con un target bloqueado y rígido en `[0, 1.5, 0]`. Esto previene que el jugador aparezca mirando de espaldas u obstruido por geometrías colindantes del modelo 3D.

### the agent's Discretion
- El retardo exacto de desvanecimiento (`fade-out` de Framer Motion) para permitir que el Canvas termine de renderizar el modelo antes de retirar el cartel de transición CRT.
- El diseño CSS de la animación del biometrix scanline en el overlay de tránsito.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Exploration Components
- `src/features/exploration/components/InsideRoomArena.tsx` — Contiene los Hooks de suscripción en tiempo real de Supabase y el montaje de la transición.
- `src/features/exploration/components/RoomCube.tsx` — Contiene la carga del escenario 3D donde se acoplará el `RoomModelErrorBoundary`.
- `src/features/exploration/components/RoomNavigation.tsx` — Contiene botones y accesos a transiciones de sala.

### Styling & Visual Theme
- `src/features/exploration/components/AcademyMap.tsx` — Referencia de animaciones CRT, glitchs y transiciones de Framer Motion.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AnimatePresence` y `motion` de `framer-motion` — Ya instalados y en uso para transiciones y animaciones fluidas CRT.
- Estilos CRT/Scanlines — Clases de utilidad CSS y animaciones glitch temáticas ya implementadas.

### Established Patterns
- Cleanups de Supabase — Se remueven los canales usando `supabase.removeChannel(ch)`.

### Integration Points
- Modificar `InsideRoomArena.tsx` agregando la transición en el cambio de sala, centralizando el cleanup de canales de tiempo real en su hook useEffect, y forzar la recreación o reseteo de la cámara al variar el ID de la sala.
- Modificar `RoomCube.tsx` introduciendo el `RoomModelErrorBoundary` envolviendo a `<RoomModel />`.

</code_context>

<specifics>
## Specific Ideas

- "El cartel CRT dirá: [CONECTANDO BIOMETRÍA SECTORIAL... ESTABLECIENDO PROTOCOLO DE EXPLORACIÓN]"
- "El reset de cámara restablece la vista en 0, 1.5, 0.1 con target en 0, 1.5, 0 en cada renderizado inicial de sala nueva."

</specifics>

<deferred>
## Deferred Ideas

- None — la discusión cubrió exhaustivamente la tolerancia a fallos y tránsitos del motor.

</deferred>

---

*Phase: 03-fallback-engine-integration*
*Context gathered: 2026-05-23*
