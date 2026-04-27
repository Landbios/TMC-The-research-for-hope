# Validation Strategy: Phase 1 - Repo Operating Model

## Dimension 1: Technical Correctness
- [ ] Root scripts (`npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`) execute without errors.
- [ ] Next.js app starts correctly from the root directory.
- [ ] Environment variables in `.env.local` are correctly resolved.

## Dimension 2: Functional Integrity
- [ ] Application behavior is unchanged after flattening.
- [ ] Vercel deployment simulation (production build) succeeds.

## Dimension 3: Structural Adherence
- [ ] `apps/` and `packages/` directories are removed.
- [ ] `tmc-scion` and `tmc-characters-maker` are moved to `/reference`.
- [ ] `.gitignore` correctly ignores `/reference/`.

## Dimension 8: Maintenance & Operations
- [ ] `DEVELOPMENT.md` exists and contains correct operating instructions.
- [ ] Legacy phases are archived in `.planning/archive/v2.0/`.
