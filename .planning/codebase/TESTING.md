# Testing Patterns

**Analysis Date:** 2026-04-26

## Test Framework

**Runner:**
- Not detected
- Config: Not detected in `package.json`, `apps/tma-client/package.json`, or config files such as `jest.config.*`, `vitest.config.*`, `playwright.config.*`, and `cypress.config.*`

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
Not detected
Not detected
Not detected
```

## Test File Organization

**Location:**
- No co-located or centralized test files were detected under `apps`, `packages`, or the repo root.

**Naming:**
- No `*.test.*`, `*.spec.*`, or `__tests__` patterns were detected.

**Structure:**
```text
Not applicable. No test directory structure is present in the scanned repository.
```

## Test Structure

**Suite Organization:**
```typescript
Not applicable. No `describe`, `it`, `test`, or `expect` usage was detected under `apps` or `packages`.
```

**Patterns:**
- Setup pattern: Not detected
- Teardown pattern: Not detected
- Assertion pattern: Not detected

## Mocking

**Framework:** Not detected

**Patterns:**
```typescript
Not applicable. No mocking utilities or test doubles were detected.
```

**What to Mock:**
- No project convention exists yet.
- When tests are added, mock Supabase browser/server clients from `apps/tma-client/src/lib/supabase/client.ts` and `apps/tma-client/src/lib/supabase/server.ts` at the module boundary rather than mocking internal chained query details in every component.
- Mock external AI calls behind the Next.js route handlers in `apps/tma-client/src/app/api/ai/clue-generator/route.ts` and `apps/tma-client/src/app/api/ai/case-builder/route.ts` instead of hitting live `@google/generative-ai`.

**What NOT to Mock:**
- Do not mock pure helpers such as `cn` and `maskEmail` in `apps/tma-client/src/lib/utils.ts` or image-crop helpers in `apps/tma-client/src/utils/cropImage.ts` and `apps/tma-client/src/features/shared/utils/cropImage.ts`.
- Do not mock Zustand state transitions in `apps/tma-client/src/store/useTmaStore.ts` when a direct state assertion can verify behavior more clearly.

## Fixtures and Factories

**Test Data:**
```typescript
Not applicable. No fixtures, factories, or test-data builders were detected.
```

**Location:**
- Not detected

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
Not detected
```

## Test Types

**Unit Tests:**
- Not used. No unit-test runner or unit-test files were detected for utilities, feature APIs, or store logic such as `apps/tma-client/src/lib/utils.ts`, `apps/tma-client/src/features/characters/api.ts`, or `apps/tma-client/src/store/useTmaStore.ts`.

**Integration Tests:**
- Not used. No integration harness was detected for Supabase-backed feature modules, Next.js route handlers, or realtime listeners such as `apps/tma-client/src/features/admin/api.ts`, `apps/tma-client/src/app/api/ai/clue-generator/route.ts`, and `apps/tma-client/src/components/GlobalCharacterListener.tsx`.

**E2E Tests:**
- Not used. No Playwright or Cypress configuration was detected in the repo root or `apps/tma-client`.

## Existing Verification Style

**Manual validation:**
- The repo exposes only app lifecycle scripts in `apps/tma-client/package.json`: `dev`, `build`, `start`, and `lint`.
- The root `package.json` exposes only workspace wrappers: `dev:client` and `build:client`.
- Current verification therefore depends on manual runtime checking in the Next.js app plus linting, not automated tests.

**Operational probes outside the test harness:**
- Diagnostic scripts exist outside `src`, such as `apps/tma-client/scratch/check_data_diagnostic.mjs`, which indicates ad hoc environment probing instead of formal tests.
- `console.log`-based observability is embedded directly in components and APIs, such as `apps/tma-client/src/components/GlobalCharacterListener.tsx`, `apps/tma-client/src/features/investigation/components/PollRealtimeListener.tsx`, and `apps/tma-client/src/features/admin/api.ts`.

## Recommended Test Placement Based On Current Structure

**Feature APIs:**
- Place tests next to the feature module, for example `apps/tma-client/src/features/characters/api.test.ts` and `apps/tma-client/src/features/admin/api.test.ts`, because the codebase already organizes domain behavior by feature folder.

**React components:**
- Co-locate component tests with the component file, such as `apps/tma-client/src/features/shared/components/ImageUploader.test.tsx` and `apps/tma-client/src/features/investigation/components/EvidenceTab.test.tsx`.

**App routes and route handlers:**
- Keep route tests beside the route or under the owning app subtree, such as `apps/tma-client/src/app/api/ai/clue-generator/route.test.ts`.

**Pure utilities and store logic:**
- Add direct unit tests beside `apps/tma-client/src/lib/utils.ts`, `apps/tma-client/src/utils/cropImage.ts`, and `apps/tma-client/src/store/useTmaStore.ts`.

## Common Patterns

**Async Testing:**
```typescript
Not applicable. No async test examples exist in the current repository.
```

**Error Testing:**
```typescript
Not applicable. No error-path test examples exist in the current repository.
```

## Gaps That Affect Testing Setup

- No test dependencies are declared in `package.json` or `apps/tma-client/package.json`.
- No DOM-testing library, React test utilities, or route-handler test harness was detected.
- No CI command for automated verification was detected.
- No seed fixtures or Supabase test environment abstraction was detected, even though many modules depend on `createClient()` from `apps/tma-client/src/lib/supabase/client.ts`.

---

*Testing analysis: 2026-04-26*
