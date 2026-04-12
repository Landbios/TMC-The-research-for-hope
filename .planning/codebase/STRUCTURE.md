# Directory Structure

## Root
- `apps/tma-client`: Main Next.js application.
- `.planning`: GSD workflow and codebase intelligence.
- `*.sql`: Database migration and setup scripts.

## apps/tma-client/src
- `app/`: Next.js App Router folders defining the application's routes.
  - `admin/`: Staff/Admin management interface.
  - `dashboard/`: User landing and HUD.
  - `login/`: Authentication entry point.
  - `map/`: Academy-wide navigation.
  - `rooms/`: Individual 3D room views.
- `features/`: Modularized business logic and components.
  - `exploration/`: 3D scene, cameras, and navigation.
  - `investigation/`: Evidence, logs, and polling logic.
  - `admin/`: Administrative tools (NPC creator, room editor).
  - `ai/`: Gemini-powered consultant features.
  - `vn-ui/`: Visual Novel-style UI components.
- `lib/`: Shared utilities and framework configurations (Supabase).
- `store/`: Global state management (Zustand).
- `components/`: Core layout and global registry components.
