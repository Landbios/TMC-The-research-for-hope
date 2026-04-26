# Coding Conventions

**Analysis Date:** 2026-04-26

## Naming Patterns

**Files:**
- Route and framework files use Next.js reserved names in `apps/tma-client/src/app`, such as `page.tsx`, `layout.tsx`, and `route.ts`.
- React component files use PascalCase in `apps/tma-client/src/components`, `apps/tma-client/src/features/*/components`, and `apps/tma-client/src/app/**`, such as `EnrollClientForm.tsx`, `ImageUploader.tsx`, and `GlobalCharacterListener.tsx`.
- Store hooks use `use`-prefixed camelCase filenames, such as `apps/tma-client/src/store/useTmaStore.ts`.
- Utility files mix camelCase and snake_case. Use existing local naming in the target folder: `apps/tma-client/src/lib/utils.ts`, `apps/tma-client/src/utils/cropImage.ts`, and `apps/tma-client/src/features/shared/utils/dice_utils.ts`.
- Feature service files use generic `api.ts` and `server-api.ts` names under each feature, such as `apps/tma-client/src/features/characters/api.ts` and `apps/tma-client/src/features/characters/server-api.ts`.

**Functions:**
- React components are exported as named or default PascalCase functions, such as `RootLayout` in `apps/tma-client/src/app/layout.tsx`, `EvidenceTab` in `apps/tma-client/src/features/investigation/components/EvidenceTab.tsx`, and `ImageUploader` in `apps/tma-client/src/features/shared/components/ImageUploader.tsx`.
- Hooks and store selectors use camelCase, such as `useTmaStore` in `apps/tma-client/src/store/useTmaStore.ts`.
- Async data-access functions use verb-first camelCase, such as `getTMACharacter`, `updateGameState`, `selectRandomAssassin`, and `finalizeAssassination` in `apps/tma-client/src/features/characters/api.ts` and `apps/tma-client/src/features/admin/api.ts`.
- Server-only helpers append `Server`, such as `getTMACharacterServer` and `getVaultCharactersServer` in `apps/tma-client/src/features/characters/server-api.ts`.

**Variables:**
- Local variables use camelCase throughout the client app, such as `selectedCharacter`, `uploading`, `cropSrc`, `pendingPolls`, and `totalStudents`.
- Booleans commonly use `is*`, `has*`, and `can*` prefixes, such as `isStoreInitialized`, `hasUnreadSignals`, `isResolving`, and `canResolve`.
- Supabase query results often destructure `data` and `error`, with aliased names when multiple queries appear in one function, such as `fetchError`, `checkError`, `msgError`, and `uploadError`.

**Types:**
- Interfaces and exported types use PascalCase, such as `TMACharacterData`, `TMAGameState`, `TMARoomPrivacyPoll`, and `ImageUploaderProps`.
- Domain enums are represented as string unions rather than `enum`, such as `TMAGamePeriod` in `apps/tma-client/src/features/characters/api.ts` and status unions in `apps/tma-client/src/store/useTmaStore.ts`.

## Code Style

**Formatting:**
- No Prettier or Biome configuration was detected in the repo root or `apps/tma-client`.
- TypeScript is strict in `apps/tma-client/tsconfig.json` with `"strict": true`, `"noEmit": true`, and `"moduleResolution": "bundler"`.
- Formatting is not fully normalized. Some files use double quotes and semicolons, such as `apps/tma-client/src/app/layout.tsx`, while others use single quotes and omit semicolons, such as `apps/tma-client/src/lib/utils.ts` and `apps/tma-client/src/lib/supabase/client.ts`.
- Use the surrounding file’s quote and semicolon style when editing. The codebase does not enforce a single repository-wide formatter.

**Linting:**
- ESLint is configured only in `apps/tma-client/eslint.config.mjs`.
- The config extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- The only explicit customization is `globalIgnores` for `.next/**`, `out/**`, `build/**`, and `next-env.d.ts`.
- No custom rule set for import order, quotes, semicolons, complexity, or testing was detected.

## Import Organization

**Order:**
1. Framework and third-party imports first, such as `react`, `next/*`, `sonner`, `lucide-react`, and `zustand`.
2. Internal alias imports from `@/` next, such as `@/lib/supabase/client` and `@/store/useTmaStore`.
3. Relative imports last when used, such as `./ImageCropperModal` in `apps/tma-client/src/features/shared/components/ImageUploader.tsx` and `../utils/cropImage` in `apps/tma-client/src/features/shared/components/ImageCropperModal.tsx`.

**Path Aliases:**
- The app uses the `@/*` alias defined in `apps/tma-client/tsconfig.json` and rooted at `apps/tma-client/src/*`.
- Use `@/` for cross-feature and shared imports inside `apps/tma-client/src`.
- Use relative imports for adjacent files in the same feature or component folder.

## Error Handling

**Patterns:**
- Data-access functions usually return fallback values for expected read failures, such as `null` or `[]` in `apps/tma-client/src/features/characters/api.ts`, `apps/tma-client/src/features/characters/server-api.ts`, and `apps/tma-client/src/features/admin/api.ts`.
- Mutation functions usually throw the raw Supabase error on failure, such as `updateGameState`, `createTmaEvidence`, and `assignAssassinStatus` in `apps/tma-client/src/features/characters/api.ts` and `apps/tma-client/src/features/admin/api.ts`.
- UI components wrap mutations in `try/catch`, then convert failures into `toast.error`, `alert`, or local state resets, such as `apps/tma-client/src/app/dashboard/enroll/EnrollClientForm.tsx`, `apps/tma-client/src/features/shared/components/ImageUploader.tsx`, and `apps/tma-client/src/features/investigation/components/EvidenceTab.tsx`.
- API routes in `apps/tma-client/src/app/api/ai/*/route.ts` catch exceptions and return `NextResponse.json(..., { status: 500 })`.
- Catch blocks are loosely typed. `unknown`, untyped `err`, and `any` all appear. Match the surrounding file instead of introducing a new local convention mid-file.

## Logging

**Framework:** `console`

**Patterns:**
- Runtime diagnostics use `console.log` and `console.error` directly in client, server, and API-route code.
- Logs use string prefixes to identify subsystem context, such as `TMA_SYSTEM`, `TMA-ADMIN`, `TMA-INVESTIGATION`, and `Gemini`.
- Logging is especially common in realtime listeners and error paths, such as `apps/tma-client/src/components/GlobalCharacterListener.tsx`, `apps/tma-client/src/features/investigation/components/PollRealtimeListener.tsx`, and `apps/tma-client/src/app/api/ai/clue-generator/route.ts`.
- No structured logger, log-level abstraction, or environment-based log suppression was detected.

## Comments

**When to Comment:**
- Comments are used sparingly and mostly explain domain intent or operational steps rather than syntax, especially in `apps/tma-client/src/features/admin/api.ts`, `apps/tma-client/src/features/characters/api.ts`, and `apps/tma-client/src/store/useTmaStore.ts`.
- Inline UI comments appear in JSX to label sections such as tabs, pagination, crop modal state, and overlays in `apps/tma-client/src/app/dashboard/enroll/EnrollClientForm.tsx` and `apps/tma-client/src/features/shared/components/ImageUploader.tsx`.

**JSDoc/TSDoc:**
- Short block comments and lightweight JSDoc-style headers appear in some utility and API files, such as `apps/tma-client/src/features/admin/api.ts` and `apps/tma-client/src/utils/cropImage.ts`.
- JSDoc is not consistently applied across exported functions. Add it only where the target file already uses that pattern or where behavior is non-obvious.

## Function Design

**Size:**
- Utility functions are small and single-purpose in `apps/tma-client/src/lib/utils.ts` and `apps/tma-client/src/utils/cropImage.ts`.
- API helper files contain many medium-sized functions grouped by feature, such as `apps/tma-client/src/features/characters/api.ts`.
- Large orchestration functions are allowed when they encode game flow, such as `finalizeAssassination` and `resolveCurrentCase` in `apps/tma-client/src/features/admin/api.ts`.

**Parameters:**
- Components generally accept a typed props interface and destructure parameters in the function signature, such as `ImageUploaderProps` in `apps/tma-client/src/features/shared/components/ImageUploader.tsx`.
- Mutation helpers use primitive parameters for identity and flags, and object parameters for larger payloads, such as `createTmaEvidence`, `createTmaNpc`, and `updateTmaEvidenceDetail` in `apps/tma-client/src/features/admin/api.ts`.

**Return Values:**
- Read helpers return typed domain objects, arrays, or `null`, such as `Promise<TMACharacterData | null>` and `Promise<CharacterData[]>`.
- Mutation helpers usually return `void`, raw inserted/updated rows, or `true` for delete/reset success, depending on the underlying Supabase call in `apps/tma-client/src/features/admin/api.ts`.

## Module Design

**Exports:**
- Feature `api.ts` modules export many top-level named functions and domain types from a single file, such as `apps/tma-client/src/features/characters/api.ts` and `apps/tma-client/src/features/admin/api.ts`.
- Components use a mix of default and named exports. Preserve the existing file convention instead of normalizing it ad hoc.
- Shared helpers usually export one primary function plus local types, such as `cn` and `maskEmail` in `apps/tma-client/src/lib/utils.ts`.

**Barrel Files:** 
- No barrel files were detected under `apps/tma-client/src` or `packages`.
- Import directly from the concrete module path instead of creating a new `index.ts` unless the surrounding folder already adopts one.

## Representative Patterns

**Client component structure:**
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EnrollClientForm({ vaultCharacters }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // mutation
    } catch (err: unknown) {
      // toast + local state handling
    }
  };
}
```
Source: `apps/tma-client/src/app/dashboard/enroll/EnrollClientForm.tsx`

**Feature API helper structure:**
```typescript
export async function updateGameState(updates: Partial<TMAGameState>): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('tma_game_state')
    .update(updates)
    .eq('id', 1);

  if (error) throw error;
}
```
Source: `apps/tma-client/src/features/characters/api.ts`

**Store action structure:**
```typescript
setPendingPolls: (updater) => set((state) => ({
  pendingPolls: typeof updater === 'function' ? updater(state.pendingPolls) : updater
})),
```
Source: `apps/tma-client/src/store/useTmaStore.ts`

---

*Convention analysis: 2026-04-26*
