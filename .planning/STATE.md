---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: Repository & Architecture Improvements
status: planning
stopped_at: Milestone initialized; requirements and roadmap prepared
last_updated: "2026-04-26T23:40:00.000Z"
last_activity: 2026-04-26
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-26)

**Core value:** To centralize the player's agency through a single, persistent "Command Center" that reduces HUD clutter and enhances immersion through deep visual personality and real-time environmental awareness.
**Current focus:** Repository and architecture improvements for milestone v2.1.

## Current Position

Phase: Not started (defining milestone work)
Plan: -
Status: Ready to discuss Phase 1
Last activity: 2026-04-26 - Milestone v2.1 started

Progress: [....................] 0%

## Performance Metrics

**Current milestone:**

- Total plans completed: 0
- Average duration: -
- Total execution time: -

**Historical context:**

- Prior roadmap work exists under `.planning/milestones/`
- Legacy phase directories will be archived before v2.1 execution begins

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Keep `apps/tma-client` as deployable root**: Avoid repo-root churn and use Vercel Root Directory instead.
- **Keep reference repos ignored by Git**: `tmc-scion` and `tmc-characters-maker` remain available locally but out of commit scope.
- **Use incremental refactors**: Create seams first, then reduce coupling without a big-bang rewrite.

### Pending Todos

5 pending - /gsd-check-todos to review

### Blockers/Concerns

- Architecture cleanup must not break auth/session refresh, realtime subscriptions, or store hydration.
- Phase numbering is reset to 1 for v2.1, so legacy phase history should stay archived, not deleted.

## Session Continuity

Last session: 2026-04-26
Stopped at: Milestone v2.1 initialized and ready for Phase 1 discussion
Resume file: None
