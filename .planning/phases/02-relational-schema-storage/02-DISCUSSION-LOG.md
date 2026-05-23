# Phase 2: Relational Schema & Storage - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 2-Relational Schema & Storage
**Areas discussed:** Origen y Alojamiento de Modelos 3D, Configuración en Base de Datos y Valores por Defecto, Sincronización y Actualización de Tipos de TypeScript, Manejo de Rutas de Modelos en la Base de Datos

---

## 1. ¿Dónde prefieres que se alojen y sirvan los archivos de los modelos 3D (.glb)?

| Option | Description | Selected |
|--------|-------------|----------|
| Alojamiento local estático en `/public/models/` | Rápido, sin latencia, autodesplegado en Vercel | ✓ |
| Bucket público en Supabase Storage | Dinámico, permite subidas en caliente | |

**User's choice:** Alojamiento local estático en `/public/models/`
**Notes:** Decisión óptima para agilizar el desarrollo inicial y asegurar estabilidad durante las pruebas de la beta, reduciendo complejidad y dependencias de red de terceros.

---

## 2. ¿Cómo deben configurarse los valores predeterminados para las nuevas columnas en PostgreSQL?

| Option | Description | Selected |
|--------|-------------|----------|
| `model_scale` por defecto en 1.0 y `model_offset_y` en 0.0 | Definidos directamente en PostgreSQL | ✓ |
| Campos completamente nullables | Manejar fallbacks en código React | |

**User's choice:** `model_scale` por defecto en 1.0 y `model_offset_y` en 0.0 definidos en la base de datos
**Notes:** Esto garantiza una estructura de base de datos sólida donde los datos crudos ya contienen valores consistentes listos para usar.

---

## 3. ¿De qué forma prefieres que sincronicemos y actualicemos las definiciones de tipos TypeScript?

| Option | Description | Selected |
|--------|-------------|----------|
| Extensión manual directa de los tipos locales | Rápido, seguro, sin sobreescribir otros tipos | ✓ |
| Regeneración completa con Supabase CLI | Requiere entorno local activo y CLI configurada | |

**User's choice:** Extensión manual directa de los tipos locales en `database.types.ts`
**Notes:** Evita dependencias de ejecución de comandos CLI complejos o la sobreescritura accidental de otros ajustes tipográficos en el codebase.

---

## 4. ¿Cuál debe ser el formato del campo model_url en la tabla de base de datos?

| Option | Description | Selected |
|--------|-------------|----------|
| Guardar nombres base de archivo o rutas relativas | ej. `coordinacion.glb`, dando flexibilidad en código | ✓ |
| Guardar URLs absolutas completas | ej. `https://host/models/coordinacion.glb` | |

**User's choice:** Guardar nombres base de archivo o rutas relativas (ej. `coordinacion.glb`)
**Notes:** Proporciona un desacoplamiento excelente entre la dirección de los datos y el host de almacenamiento físico.

---

## the agent's Discretion

- Elección del nombre exacto de la migración de base de datos (`supabase_migrations_tma_v5_models.sql`).
- Lógica de conversión de strings para las rutas relativas en React.

---

## Deferred Ideas

- Almacenamiento en la nube (Supabase Cloud Storage) con CDN — Postergado para optimizaciones de escalabilidad futuras.
