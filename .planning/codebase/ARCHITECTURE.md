# Architecture Overview

## Design Patterns
- **Feature-Based Decomposition**: The codebase is organized into features (e.g., `exploration`, `investigation`, `admin`) rather than technical layers, promoting modularity.
- **Client-Side 3D Rendering**: Uses `three.js` and `react-three-fiber` for interactive 3D environments, managed within the `exploration` feature.
- **Atomic State Management**: `zustand` is used for global application state, with a single store `useTmaStore.ts`.
- **Serverless Backend**: Integrated with Supabase for Auth, Database, and real-time updates.

## Core Flow
1. **Authentication**: Handled via Supabase SSR in `lib/supabase`. Middleware manages session protection.
2. **Navigation**: Next.js App Router for page transitions; `CameraController` and `RoomNavigation` for in-scene movement.
3. **Data Persistence**: React components interact with feature-specific `api.ts` files, which interface with Supabase.
4. **Real-time**: Real-time listeners (e.g., `PollRealtimeListener`) are used for collaborative features.

## Critical Paths
- **3D Scene Initialization**: `InsideRoomArena.tsx` manages the lifecycle of 3D objects (NPCs, Evidence).
- **Administrative Control**: `AdminRoomEditor.tsx` and related components provide real-time environment editing.
