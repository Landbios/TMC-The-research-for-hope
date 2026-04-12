# Coding Conventions

## Language & Framework
- **TypeScript**: Strict typing encouraged.
- **Next.js**: App Router conventions used for routing.
- **React**: Functional components with Hooks.

## Component Structure
- **Location**: Feature-specific components located in `src/features/[feature-name]/components/`.
- **Global Components**: Managed in `src/components/`.
- **UI Base**: Reusable UI components in `src/components/ui/` (e.g., `ImageUploader`).

## Styling
- **Tailwind CSS 4**: Modern Tailwind utilities.
- **Dynamic Classes**: Handled via `clsx` and `tailwind-merge` for safe concatenation.

## State Management
- **Zustand**: Centralized store `useTmaStore.ts` for cross-feature state.

## Naming
- **Files**: `kebab-case` for most files, `PascalCase` for React components.
- **Variables/Functions**: `camelCase`.
- **SQL**: `snake_case` for database entities.
