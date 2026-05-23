# Phase 2: Relational Schema & Storage - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Establecer la estructura de persistencia en base de datos para los modelos 3D agregando campos específicos (`model_url`, `model_scale`, `model_offset_y`) en la tabla `tma_rooms` de Supabase, y configurar el almacenamiento de los archivos `.glb` locales en el directorio público del cliente (`/public/models/`). También incluye la sincronización segura de los tipos TypeScript de base de datos.

</domain>

<decisions>
## Implementation Decisions

### Alojamiento y Servido de Modelos 3D
- **D-01:** Los archivos de los modelos `.glb` se servirán estáticamente desde el directorio local `/public/models/` de la aplicación Next.js. Esto proporciona cargas instantáneas con cero latencia de red adicional, despliegue atómico con Vercel y simplicidad para el beta test.

### Configuración en Base de Datos
- **D-02:** Las nuevas columnas en la tabla `tma_rooms` de PostgreSQL se configurarán con las siguientes especificaciones:
  - `model_url`: Tipo `text` (nullable, por defecto NULL).
  - `model_scale`: Tipo `numeric` o `double precision` (DEFAULT `1.0`, para escalar de forma proporcional).
  - `model_offset_y`: Tipo `numeric` o `double precision` (DEFAULT `0.0`, para ajustes de altura vertical).
  Esto asegura que la base de datos provea valores válidos por defecto al visor 3D antes de procesarse en React.

### Sincronización de Tipos TypeScript
- **D-03:** Los tipos autogenerados de Supabase se actualizarán de forma manual y localizada directamente dentro del archivo `database.types.ts` (y archivos relacionados como `database.types_readable.ts`). Esto previene el riesgo de sobreescritura accidental o problemas por no tener un entorno local de Supabase activo, permitiendo una integración rápida, segura y focalizada.

### Formato del Campo model_url
- **D-04:** El campo `model_url` guardará únicamente la ruta relativa o nombre de archivo base (ej: `coordinacion.glb` o `/models/coordinacion.glb`). La lógica de la aplicación resolverá la URL completa basándose en la configuración de la app, permitiendo una migración fluida a un bucket CDN o Supabase Storage en el futuro sin modificar la base de datos.

### the agent's Discretion
- El nombre exacto y número del script de migración SQL (`supabase_migrations_tma_v5_models.sql`).
- La lógica interna de fallback en JavaScript para resolver las rutas relativas en caso de que falten barras diagonales en la URL de la base de datos.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema and Migrations
- `database.types.ts` — Definiciones de tipos TypeScript principales de Supabase.
- `database.types_readable.ts` — Definición amigable de tipos TypeScript de la base de datos.
- `DATABASE.md` — Documentación general de referencia del esquema de base de datos del proyecto.
- `supabase_migrations_tma_v2.sql` — Referencia histórica del DDL para la tabla `tma_rooms`.

### Exploration Visor
- `src/features/exploration/components/RoomCube.tsx` — Componente visor de sala que utilizará los campos de base de datos (`model_url`, `model_scale`, `model_offset_y`) para instanciar el modelo 3D.
- `src/features/exploration/components/InsideRoomArena.tsx` — Lógica de exploración que descarga los datos de la sala desde Supabase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RoomCube.tsx` — Contiene el mapa estático temporal (`LOCAL_MODEL_MAP`) que será reemplazado por la consulta directa a las propiedades de la base de datos.

### Established Patterns
- Migraciones de Supabase — Se guardan como archivos SQL en la raíz del proyecto para aplicarse secuencialmente en el panel de control de Supabase.

### Integration Points
- Extender la tabla `tma_rooms` y modificar el componente `RoomCube.tsx` para leer los campos dinámicos `model_url`, `model_scale`, y `model_offset_y` provenientes de la base de datos Supabase en lugar del mapa estático local de pruebas de la Fase 1.

</code_context>

<specifics>
## Specific Ideas

- "La base de datos maneja la escala en 1.0 y el offset vertical en 0.0 por defecto para evitar distorsiones si no se especifican configuraciones de modelo personalizadas."
- "El código de `RoomCube` antepondrá automáticamente la ruta `/models/` si el campo `model_url` guardado en la BD es relativo."

</specifics>

<deferred>
## Deferred Ideas

- Bucket de almacenamiento dinámico `room-models` en Supabase Storage con caching CDN en producción — Fase Futura o posterior optimización de despliegue.

</deferred>

---

*Phase: 02-relational-schema-storage*
*Context gathered: 2026-05-23*
