# Technology Stack

**Analysis Date:** 2026-04-26

## Languages

**Primary:**
- TypeScript 5.x - Main application language across `apps/tma-client`, `tmc-scion`, and `tmc-characters-maker` (`apps/tma-client/package.json`, `tmc-scion/package.json`, `tmc-characters-maker/package.json`)

**Secondary:**
- JavaScript / ES modules - Config and diagnostic scripts in `apps/tma-client/eslint.config.mjs`, `apps/tma-client/postcss.config.mjs`, `apps/tma-client/scratch/check_data_diagnostic.mjs`, `tmc-scion/postcss.config.mjs`, `tmc-characters-maker/postcss.config.mjs`
- SQL - Schema and migration assets in `schema.sql`, `db_tma_clues.sql`, `db_tma_update.sql`, `supabase_migrations_tma_v1.sql`, `supabase_migrations_tma_v2.sql`, `supabase_migrations_tma_v3_stealth.sql`, `supabase_migrations_tma_v4_assassin_reset.sql`, `apps/tma-client/supabase_migrations_tma_v4_privacy.sql`, `tmc-characters-maker/supabase_migrations*.sql`
- CSS - Global styling in `apps/tma-client/src/app/globals.css`, `tmc-scion/app/globals.css`, `tmc-characters-maker/app/globals.css`

## Runtime

**Environment:**
- Node.js - Required by all Next.js apps; no pinned version file such as `.nvmrc` or `.node-version` is present
- Browser runtime - Client components and Supabase browser clients in `apps/tma-client/src/lib/supabase/client.ts`, `tmc-scion/lib/supabase/client.ts`, `tmc-characters-maker/utils/supabase/client.ts`

**Package Manager:**
- npm workspaces at repo root via `package.json`
- Lockfile: present (`package-lock.json`, lockfileVersion 3)
- Nested npm projects also maintain their own lockfiles in `tmc-scion/package-lock.json` and `tmc-characters-maker/package-lock.json`

## Frameworks

**Core:**
- Next.js 16.2.1 - Primary app framework for `apps/tma-client` (`apps/tma-client/package.json`)
- React 19.2.4 - UI runtime for `apps/tma-client` (`apps/tma-client/package.json`)
- Next.js 15.4.9 + React 19.2.1 - Standalone nested apps `tmc-scion` and `tmc-characters-maker` (`tmc-scion/package.json`, `tmc-characters-maker/package.json`)

**Testing:**
- Not detected - no Jest, Vitest, Playwright, Cypress, or test scripts were found in root or app manifests

**Build/Dev:**
- TypeScript 5 - Static typing across all applications (`apps/tma-client/tsconfig.json`, `tmc-scion/tsconfig.json`, `tmc-characters-maker/tsconfig.json`)
- ESLint 9 - Linting in `apps/tma-client/eslint.config.mjs`, `tmc-scion/eslint.config.mjs`, `tmc-characters-maker/eslint.config.mjs`
- Tailwind CSS 4 - Styling pipeline in each app manifest and PostCSS config (`apps/tma-client/package.json`, `apps/tma-client/postcss.config.mjs`, `tmc-scion/package.json`, `tmc-characters-maker/package.json`)
- PostCSS - CSS build integration in `apps/tma-client/postcss.config.mjs`, `tmc-scion/postcss.config.mjs`, `tmc-characters-maker/postcss.config.mjs`

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` - Primary database, auth, storage, and realtime client used throughout all three apps (`apps/tma-client/src/lib/supabase/*.ts`, `tmc-scion/lib/supabase/*.ts`, `tmc-characters-maker/utils/supabase/*.ts`)
- `@supabase/ssr` - Server/browser client bootstrapping and cookie-bound auth session support (`apps/tma-client/src/lib/supabase/server.ts`, `apps/tma-client/src/lib/supabase/middleware.ts`, `tmc-scion/lib/supabase/server.ts`, `tmc-characters-maker/middleware.ts`)
- `next` / `react` / `react-dom` - App Router UI stack across the repo (`apps/tma-client/package.json`, `tmc-scion/package.json`, `tmc-characters-maker/package.json`)

**Infrastructure:**
- `@google/generative-ai` - Gemini integration for AI route handlers in `apps/tma-client/src/app/api/ai/case-builder/route.ts` and `apps/tma-client/src/app/api/ai/clue-generator/route.ts`
- `@google/genai` - Installed in `tmc-scion/package.json`; active code usage was not detected in `tmc-scion/`
- `three`, `@react-three/fiber`, `@react-three/drei` - 3D exploration and scene rendering in `apps/tma-client` (`apps/tma-client/package.json`, `README.md`)
- `zustand` - Client state stores in `apps/tma-client/src/store/useTmaStore.ts`, `tmc-scion/store/*.ts`, `tmc-characters-maker/store/character-store.ts`
- `framer-motion` / `motion` - UI animation libraries in `apps/tma-client/package.json`, `tmc-scion/package.json`, `tmc-characters-maker/package.json`
- `react-easy-crop` - Image cropping flows in `apps/tma-client/package.json`, `tmc-characters-maker/package.json`
- `sonner` - Toast notifications in `apps/tma-client/src/app/login/page.tsx`, `tmc-scion/app/login/page.tsx`, `tmc-characters-maker/app/login/page.tsx`
- `@dnd-kit/*` - Character editor drag-and-drop in `tmc-characters-maker/package.json`
- `jspdf` and `html2canvas-oklch` - Export/generation utilities in `tmc-characters-maker/package.json` and `tmc-characters-maker/components/StudentIdExport.tsx`
- `firebase-tools` - Developer dependency in `tmc-scion/package.json` and `tmc-characters-maker/package.json`; active project code usage was not detected

## Configuration

**Environment:**
- Root workspace wiring is defined in `package.json` with workspaces for `apps/*` and `packages/*`
- `apps/tma-client` expects Supabase public URL/key values in `apps/tma-client/src/lib/supabase/client.ts`, `apps/tma-client/src/lib/supabase/server.ts`, and AI credentials in `apps/tma-client/src/app/api/ai/*/route.ts`
- `tmc-scion` expects Supabase public URL/key values in `tmc-scion/lib/supabase/*.ts`; optional `DISABLE_HMR` is read in `tmc-scion/next.config.ts`; `.env.example` documents `GEMINI_API_KEY` and `APP_URL` in `tmc-scion/.env.example`
- `tmc-characters-maker` expects Supabase public URL/key values in `tmc-characters-maker/utils/supabase/*.ts`, deployment URL vars in `tmc-characters-maker/utils/url.ts`, and a Discord webhook secret in `tmc-characters-maker/app/api/webhooks/discord/route.ts`
- `.env.local` exists under `apps/tma-client/.env.local`; its contents were not inspected

**Build:**
- Root scripts expose `npm run dev:client` and `npm run build:client` from `package.json`
- `apps/tma-client` uses `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`
- `tmc-scion` uses `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`
- `tmc-characters-maker` uses `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`

## Platform Requirements

**Development:**
- Run `npm install` at repo root for the workspace app described in `README.md`
- Run `npm install` separately inside `tmc-scion/` and `tmc-characters-maker/` because they are independent nested apps with their own lockfiles and manifests
- Supabase project access is required for authenticated flows, database access, realtime subscriptions, and storage uploads (`apps/tma-client/src/components/ui/ImageUploader.tsx`, `tmc-scion/components/ImageUploader.tsx`, `tmc-characters-maker/components/ImageUploader.tsx`)

**Production:**
- Next.js server deployment target for all apps
- `tmc-scion` and `tmc-characters-maker` are configured for standalone output in `tmc-scion/next.config.ts` and `tmc-characters-maker/next.config.ts`
- `tmc-characters-maker` includes Vercel-aware callback URL handling in `tmc-characters-maker/utils/url.ts`

---

*Stack analysis: 2026-04-26*
