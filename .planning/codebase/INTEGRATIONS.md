# External Integrations

**Analysis Date:** 2026-04-26

## APIs & External Services

**Backend as a Service:**
- Supabase - Core backend for auth, Postgres access, storage, and realtime subscriptions across all apps
  - SDK/Client: `@supabase/supabase-js`, `@supabase/ssr`
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Implementation files: `apps/tma-client/src/lib/supabase/client.ts`, `apps/tma-client/src/lib/supabase/server.ts`, `apps/tma-client/src/lib/supabase/middleware.ts`, `tmc-scion/lib/supabase/client.ts`, `tmc-scion/lib/supabase/server.ts`, `tmc-scion/lib/supabase/middleware.ts`, `tmc-characters-maker/utils/supabase/client.ts`, `tmc-characters-maker/utils/supabase/server.ts`, `tmc-characters-maker/middleware.ts`

**Generative AI:**
- Google Gemini - Server-side text generation for case summaries and clue generation in `apps/tma-client`
  - SDK/Client: `@google/generative-ai`
  - Auth: `GOOGLE_GENERATIVE_AI_API_KEY`
  - Endpoints: `apps/tma-client/src/app/api/ai/case-builder/route.ts`, `apps/tma-client/src/app/api/ai/clue-generator/route.ts`
- Google GenAI package - Installed in `tmc-scion/package.json`
  - SDK/Client: `@google/genai`
  - Auth: Not detected in active `tmc-scion/` runtime code

**Identity Federation:**
- Discord OAuth via Supabase Auth - Optional login provider in all three Next.js apps
  - SDK/Client: Supabase Auth through `@supabase/supabase-js`
  - Auth: Supabase provider configuration plus public Supabase URL/key
  - Implementation: `apps/tma-client/src/app/login/page.tsx`, `tmc-scion/app/login/page.tsx`, `tmc-characters-maker/app/login/page.tsx`

**Remote Asset Fetching:**
- External image hosts proxied through Next.js route in `tmc-characters-maker`
  - SDK/Client: native `fetch`
  - Auth: none
  - Endpoint: `tmc-characters-maker/app/api/proxy-image/route.ts`
- Next Image remote patterns allow direct external assets in `apps/tma-client/next.config.ts`, `tmc-scion/next.config.ts`, and `tmc-characters-maker/next.config.ts`

## Data Storage

**Databases:**
- Supabase Postgres
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/supabase-js` via SSR/browser helpers
  - Schema artifacts: `schema.sql`, `db_tma_clues.sql`, `db_tma_update.sql`, `supabase_migrations_tma_v1.sql`, `supabase_migrations_tma_v2.sql`, `supabase_migrations_tma_v3_stealth.sql`, `supabase_migrations_tma_v4_assassin_reset.sql`, `apps/tma-client/supabase_migrations_tma_v4_privacy.sql`, `tmc-characters-maker/supabase_schema.sql`, `tmc-characters-maker/supabase_migrations*.sql`

**File Storage:**
- Supabase Storage
  - Character image uploads use bucket defaults such as `character-images` in `apps/tma-client/src/components/ui/ImageUploader.tsx`
  - Evidence image uploads use bucket defaults such as `evidence-images` in `apps/tma-client/src/features/shared/components/ImageUploader.tsx`
  - Nested apps also upload through Supabase Storage in `tmc-scion/components/ImageUploader.tsx` and `tmc-characters-maker/components/ImageUploader.tsx`
  - Public asset URLs are consumed through Supabase storage paths allowed in `apps/tma-client/next.config.ts`

**Caching:**
- Framework-level HTTP caching only
  - `tmc-characters-maker/app/api/proxy-image/route.ts` sets `Cache-Control: public, max-age=3600`
  - No Redis, Memcached, or dedicated application cache service was detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: email/password, email confirmation callback, session middleware, and Discord OAuth
  - Middleware enforcement: `apps/tma-client/src/middleware.ts`, `tmc-scion/middleware.ts`, `tmc-characters-maker/middleware.ts`
  - Email/OAuth callback handlers: `tmc-scion/app/auth/callback/route.ts`, `tmc-characters-maker/app/auth/callback/route.ts`
  - `apps/tma-client/src/app/login/page.tsx` redirects to `/auth/callback`, but no corresponding handler file was detected under `apps/tma-client/src/app/`

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console logging inside route handlers and client flows
  - AI route errors: `apps/tma-client/src/app/api/ai/case-builder/route.ts`, `apps/tma-client/src/app/api/ai/clue-generator/route.ts`
  - Proxy route errors: `tmc-characters-maker/app/api/proxy-image/route.ts`
  - Discord webhook errors: `tmc-characters-maker/app/api/webhooks/discord/route.ts`

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured at repo root
- Vercel-oriented deployment signals exist in `tmc-characters-maker/utils/url.ts` through `NEXT_PUBLIC_VERCEL_URL`
- Standalone Next.js server output is enabled in `tmc-scion/next.config.ts` and `tmc-characters-maker/next.config.ts`

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - used in `apps/tma-client/src/lib/supabase/*.ts`, `tmc-scion/lib/supabase/*.ts`, `tmc-characters-maker/utils/supabase/*.ts`, `tmc-characters-maker/middleware.ts`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - used in the same Supabase client/server files above
- `GOOGLE_GENERATIVE_AI_API_KEY` - required by `apps/tma-client/src/app/api/ai/case-builder/route.ts` and `apps/tma-client/src/app/api/ai/clue-generator/route.ts`
- `DISCORD_BOT_SECRET` - required by `tmc-characters-maker/app/api/webhooks/discord/route.ts`

**Optional env vars detected in code:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - fallback key in `tmc-characters-maker/utils/supabase/client.ts`, `tmc-characters-maker/utils/supabase/server.ts`, `tmc-characters-maker/middleware.ts`
- `NEXT_PUBLIC_SITE_URL` - callback URL base in `tmc-characters-maker/utils/url.ts`
- `NEXT_PUBLIC_VERCEL_URL` - callback URL base fallback in `tmc-characters-maker/utils/url.ts`
- `DISABLE_HMR` - development watcher toggle in `tmc-scion/next.config.ts`
- `NODE_ENV` - runtime environment checks in `tmc-scion/app/auth/callback/route.ts` and `tmc-characters-maker/components/ServiceWorkerRegistration.tsx`
- `GEMINI_API_KEY`, `APP_URL` - documented in `tmc-scion/.env.example`; active runtime reads were not detected in `tmc-scion/`

**Secrets location:**
- Environment variables and local env files
- `apps/tma-client/.env.local` exists and was not inspected
- `tmc-scion/.env.example` documents expected variables without shipping secrets

## Webhooks & Callbacks

**Incoming:**
- Supabase auth callback for `tmc-scion`: `GET /auth/callback` in `tmc-scion/app/auth/callback/route.ts`
- Supabase auth callback for `tmc-characters-maker`: `GET /auth/callback` in `tmc-characters-maker/app/auth/callback/route.ts`
- Discord bot webhook for automatic character creation: `POST /api/webhooks/discord` in `tmc-characters-maker/app/api/webhooks/discord/route.ts`

**Outgoing:**
- Gemini API requests from `apps/tma-client/src/app/api/ai/case-builder/route.ts` and `apps/tma-client/src/app/api/ai/clue-generator/route.ts`
- Supabase realtime subscriptions using `channel(...).on('postgres_changes', ...)` in `apps/tma-client/src/components/GlobalNotificationListener.tsx`, `apps/tma-client/src/components/GlobalCharacterListener.tsx`, `apps/tma-client/src/features/exploration/components/AcademyMap.tsx`, `apps/tma-client/src/features/exploration/components/InsideRoomArena.tsx`, `apps/tma-client/src/features/investigation/components/PollRealtimeListener.tsx`, `apps/tma-client/src/features/dashboard/components/VerticalChatLog.tsx`, and related client listeners
- External image fetches from `tmc-characters-maker/app/api/proxy-image/route.ts`

---

*Integration audit: 2026-04-26*
