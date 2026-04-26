# Requirements: Nervalis 2.0 - The Command Center

This document defines the technical and functional requirements for the Nervalis 2.0 overhaul, focused on centralization, live-intel awareness, and aesthetic polish.

## 1. Unified Terminal (Nervalis 2.0)
- **R1.1: Aesthetic Polish**: Implement HUD scanlines, CRT artifacts, and "glitch" entry/exit animations. 
- **R1.2: Draggable Persistence**: Terminal state (active tab, scroll position) must persist when dragged or minimized.
- **R1.3: Notification System**: A minimal HUD indicator (e.g., a "New Signal" icon or pulsing line) visible when the terminal is closed, alerting to unread chats or active polls.

## 2. Dynamic Room Navigation
- **R2.1: Live-Intel Room List**: Replace the `AcademyMap` (3D) in the MAP tab with a vertically scrollable list of rooms.
- **R2.2: Presence Metadata**: Each room in the list must display the count and name of students currently inside.
- **R2.3: Room Status Flags**:
  *   **PRIVATE**: Indicator if the room is currently in a privacy session.
  *   **MAINTENANCE**: Indicator if the room is locked (e.g., crime scene).
- **R2.4: Instant Transit**: Clicking a room name performs the room navigation logic (replacing current 3D navigation).

## 3. Distributed Role & Self Tabs
- **R3.1: ADMIN Tab (Staff Only)**: A dedicated tab for staff/superadmin to perform "Character Possession" (switching controlled character data).
- **R3.2: SELF Tab (Student Profile)**: A dedicated space for the player to view their own character sheet, stats (IP), and current status.
- **R3.3: DATABASE Refinement**: Optimize the "STUDENTS" (DB) tab to show detailed biographies and discovered clues per student.

## 4. Feature Migration
- **R4.1: Group Chat Integration**: Migrate the existing `VNChatOverlay` group logic or create a specialized history view within the CHAT tab for multi-person logs.
- **R4.2: Evidence Poll Integration**: Move the `PrivacyPollModal` and relevant evidence voting logic into a specialized "POLLS" or "SYS" sub-section.

## 5. Technical Constraints
- **Performance**: Terminal animations must not lag the 3D room view (use Framer Motion `layoutId` or optimized variants).
- **Responsiveness**: The terminal must be usable on mobile devices (scaling and drag constraints).
- **State Source**: Use `useTmaStore` (Zustand) for all live intel and notification states.
