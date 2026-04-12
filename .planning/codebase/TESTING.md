# Testing Strategy

## Current Status
- **Automated Tests**: None. There is no `test` script in the root or client `package.json`, and no testing-related dependencies (e.g., Jest, Vitest, Cypress) are installed.

## Recommendations
- **Unit Testing**: Integrate `Vitest` for business logic within the `features/` directory (e.g., `dice_utils.ts`, `api.ts` error handling).
- **Component Testing**: Use `React Testing Library` for critical UI components.
- **E2E Testing**: `Playwright` is recommended for validating the 3D scene interactions and complex workflows like evidence collection.
- **Manual Verification**: Currently, manual testing is the primary method of validation for 3D interactions and user flows.
