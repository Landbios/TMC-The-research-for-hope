# Phase Context: Phase 1 - Repo Operating Model
**Status:** Decisions Locked (2026-04-26)

## Domain boundary
This phase focuses on the physical and structural reorganization of the repository to simplify deployment and maintenance. It converts the repository from a "monorepo of one" to a standard Next.js project structure at the root.

## Implementation Decisions

### 1. Repository Flattening
- **Decision:** Move the contents of `apps/tma-client/` directly to the repository root.
- **Rationale:** Nesting the main app in `apps/` is unnecessary since it's the only active project, and it complicates Vercel deployment paths and local script execution.
- **Actions:**
  - Move `src/`, `public/`, `app/`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, and `.env.local` to root.
  - Delete `apps/` and `packages/` directories after migration.

### 2. Reference Repository Isolation
- **Decision:** Move `tmc-scion` and `tmc-characters-maker` to a new `/reference` directory.
- **Rationale:** These are local-only reference tools and should not be part of the production commit history or deployment bundle.
- **Actions:**
  - Create `/reference` folder.
  - Update `.gitignore` to explicitly ignore `/reference/`.

### 3. Unified Root Scripting
- **Decision:** Convert the root `package.json` into the primary app manifest.
- **Rationale:** Provides a "one-click" experience for developers and CI/CD.
- **Required Scripts:**
  - `dev`: Start the Next.js dev server.
  - `build`: Production build.
  - `lint`: Project-wide linting.
  - `typecheck`: Project-wide TypeScript verification.

### 4. Documentation
- **Decision:** Create `DEVELOPMENT.md` in the root.
- **Rationale:** Consolidate operating instructions, environment setup, and deployment guidance in one place.

### 5. Legacy Archiving
- **Decision:** Move all previous phase folders (e.g., from Milestone v2.0) to `.planning/archive/v2.0/`.
- **Rationale:** Keeps the active `.planning/phases/` directory focused on the current milestone while preserving history.

## Canonical Refs
- [ROADMAP.md](file:///c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/.planning/ROADMAP.md) - Milestone v2.1 definition.
- [PROJECT.md](file:///c:/Users/opbvn/Desktop/Wira/Programacion/TMC-The-research-for-hope/.planning/PROJECT.md) - Core project vision and constraints.

## Code Context
- **Root package.json**: Current entry point for workspaces.
- **apps/tma-client**: Current location of the deployable app.
- **tmc-scion / tmc-characters-maker**: Root directories to be moved to `/reference`.

## Deferred Ideas
- **Modular Boundaries (Phase 2)**: Further decoupling of `src/features` into standalone-like modules will be explored in the next phase.
