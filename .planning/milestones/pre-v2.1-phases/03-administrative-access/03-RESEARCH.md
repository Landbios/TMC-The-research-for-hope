# Phase 3: Administrative Access & Neural Possession - Technical Research

## 1. Architectural Approach

### 1.1 Extracting Possession from STUDENTS
- **Current State:** The `STUDENTS` tab allows anyone who clicks a student to see the "Inyectar Posesión" button in the collapsible details view. This is a severe security/design issue as only STAFF should have this power.
- **Solution:** Remove the "Inyectar Posesión" button from the `STUDENTS` tab rendering logic. The `STUDENTS` tab should function purely as a public database (read-only) for all roleplayers.

### 1.2 The New ADMIN Tab
- **Current State:** There is a `SYSTEM` tab accessible by everyone that exposes game state variables (Reset Protocols, Bodymode_Pulse).
- **Solution:** 
  1. Rename the `SYSTEM` tab to `ADMIN`.
  2. Implement a firm role check: `<NavButton>` for `ADMIN` only renders if `useTmaStore.getState().userRole === 'staff' || useTmaStore.getState().userRole === 'superadmin'`.
  3. Move the character selection and "Neural Possession" logic into the `ADMIN` tab interface, providing staff with a dedicated list of injectable bodies.
  4. Keep the System Diagnostics controls inside this `ADMIN` tab.

## 2. Dependencies & Files
 - `src/features/dashboard/components/NervalisOverlay.tsx`: We will manipulate the `NavButton` lists and rewrite the handling for `activeTab === 'ADMIN'`.

## 3. Potential Pitfalls
- **State Leakage:** `selectedStudent` state is currently used for the `STUDENTS` tab. If we build a possession UI in the `ADMIN` tab, we might need a separate generic selector or re-use the `students` list. 
  - **Mitigation:** Since `students` state is populated when viewing the `STUDENTS` tab via a `useEffect`, we currently have a bug if someone goes to `ADMIN` before `STUDENTS`.
  - **Fix:** We must ensure the `useEffect` that fetches `getAllTMACharacters()` fires when `activeTab === 'STUDENTS' || activeTab === 'ADMIN'`.
