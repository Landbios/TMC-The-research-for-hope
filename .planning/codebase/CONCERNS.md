# Technical Concerns & Debt

## 1. Testing Coverage (High Risk)
- **Problem**: Zero automated tests (unit, integration, or E2E).
- **Impact**: High risk of regressions, especially in complex 3D scene logic and real-time state synchronization.
- **Recommendation**: Introduce Vitest for core logic and Playwright for 3D interactions.

## 2. client-Side Logic (Security/Integrity Risk)
- **Problem**: investigation Point (IP) deduction and other game mechanics appear to be initiated and partially managed on the client.
- **Impact**: users could potentially bypass IP costs if Row Level Security (RLS) policies on Supabase are not strictly enforcing these deductions via Database Functions or Triggers.
- **Recommendation**: Ensure all sensitive game state transitions are handled via Supabase RPC functions or database triggers.

## 3. Monolithic State Management
- **Problem**: `useTmaStore.ts` acts as a global "God Store" for most application state.
- **Impact**: as the feature set (Investigation, Chat, VN-UI, Map) grows, the store may become difficult to maintain and could cause unnecessary re-renders.
- **Recommendation**: split the store into smaller, feature-specific stores or use Zustand's slice pattern.

## 4. Migration Fragmentation
- **Problem**: numerous `supabase_migrations_tma_v*.sql` files in the root.
- **Impact**: difficult to track the "source of truth" for the database schema without a unified migration runner (e.g., Supabase CLI).
- **Recommendation**: formalize the migration process using the Supabase CLI and consolidate initial state.

## 5. 3D Asset Management
- **Problem**: asset loading and management are distributed within components (e.g., `EvidenceSprite3D`).
- **Impact**: could lead to memory leaks or slow performance if assets are not properly cached or if too many high-res textures are used in the `RoomCube`.
- **Recommendation**: implement an asset pre-loading and management utility.
