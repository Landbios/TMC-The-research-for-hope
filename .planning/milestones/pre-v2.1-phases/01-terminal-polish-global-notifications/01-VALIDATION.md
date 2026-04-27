# Phase 1 Validation Strategy
*Target: 01-terminal-polish-global-notifications*
*Generated: 2026-04-11*

## Validation Architecture

1. **Test Environment**
   - In-browser visual testing of the Nervalis UI component.
   - Using the existing game environment (e.g., login, entering a room).

2. **Required Verifications**
   - **Persistence:** Verify `isNervalisOpen` toggle maintains terminal content AND drag position.
   - **HUD Notifications:** Verify the main HUD displays an indicator when `hasUnread` is active, and test that it clears upon opening the terminal.
   - **Aesthetics:** Visually confirm the CRT overlay does not block interactivity (pointer-events-none).

3. **Data Scenarios**
   - State mutations via Zustand (`useTmaStore`). Trigger real or mock message reception to test the `hasUnread` logic.
