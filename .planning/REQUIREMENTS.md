# Requirements: Milestone 2.0 - Beta Readiness & Tactical Polish

## Overview
This milestone focuses on hardening the existing systems, integrating real AI summaries for the murder coordination phase, and refining UI visibility rules to prevent "out-of-character" staff tools from leaking into immersive room views.

## Functional Requirements

### 1. Assassination Poll Visibility [BETA-01]
- The "Blackout Protocol" (Assassination Poll) overlay must be visible to:
  - Users with `userRole === 'roleplayer'`.
  - Users with `userRole === 'staff'` or `userRole === 'superadmin'` **ONLY IF** they are not currently possessing an NPC (i.e., `myCharacterId === originalCharacter.id`).
- Staff members possessing an NPC should not see the poll, as it would interfere with their NPC roleplay.

### 2. Gemini AI Case Summary [BETA-02]
- Replace the static "Simulation" text in `finalizeAssassination` with a real call to the Gemini API.
- **Context Awareness**: The AI prompt should include:
  - Recent room dialogue logs (from `tma_messages`).
  - Store actions (Assassin Shop purchases/logs).
- **Output**: A professional "Tactical Evaluation" summary that feels like an automated system report (SCION).

### 3. Identity Switcher Scoping [BETA-03]
- The NPC Selector (Diamond identity switcher) must be hidden when the user is inside a room (`/rooms/[roomId]`).
- It should only be visible when the user is viewing the Map or the Dashboard.
- **Rationale**: To prevent accidental identity flips during immersive roleplay sessions.

### 4. Admin Dashboard Polish [BETA-04]
- Ensure the Admin Dashboard correctly displays all volunteers and allows the selection of an assassin.
- Verify that the Coordination Stage transitions (PLANNING -> PREPARATION -> EXECUTION -> FINISHED) are robust and clear.

## Technical Requirements
- Implement a Server Action or Next.js Route Handler for Gemini API calls to keep the API key secure.
- Use the `@google/generative-ai` SDK.
- Update `GlobalPollOverlay.tsx` with refined role/possession checks.
- Add route-based conditional rendering for the `StaffIdentitySwitcher`.

## Verification Criteria (UAT)
- [ ] Log in as Staff: Verify the NPC Selector is visible on the Map but hidden in rooms.
- [ ] Log in as Staff: Ensure the Assassination Poll appears if no NPC is possessed.
- [ ] Possess an NPC: Verify the Assassination Poll disappears.
- [ ] Finalize a Coordination phase: Verify that a unique, AI-generated summary appears based on the actual room logs.
