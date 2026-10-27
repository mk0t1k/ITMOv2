# Tasks: Planetary Events Planner

**Input**: Design documents from `/specs/002-planetary-events-planner/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Tests**: Unit tests in Vitest required by SC-006 and project testing strategy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Exact file paths specified in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verification of workspace readiness and test harness preparation

- [X] T001 Verify project test environment and script runners (`scripts/check.sh`)
- [X] T002 [P] Prepare unit test scaffolding file `tests/astronomical_events.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, interfaces, error codes, and validation logic that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: All user stories depend on these type contracts and validation rules

- [X] T003 Define unified TypeScript types and interfaces (`EventType`, `ValidationErrorCode`, `EventSearchStatus`, `PlannerUIState`, `EventSearchParams`, `EventSearchResult`) in `src/core/astronomicalEvents.ts` conforming strictly to `CONTRACT.md`
- [X] T004 Implement input parameter validation function `validateEventParams(params, knownPlanetIds)` in `src/core/astronomicalEvents.ts` checking planet count, range bounds (`1..36500`), valid IDs, and positive time range
- [X] T005 [P] Implement angular distance and circular normalization utility helpers in `src/core/astronomicalEvents.ts` ensuring output normalization strictly in `[0, 180]` degrees (`[0, π]` rad)

**Checkpoint**: Core data models and validation functions ready.

---

## Phase 3: User Story 1 - Configure and Search Astronomical Events (Priority: P1) 🎯 MVP

**Goal**: Enable users to search for planetary alignments (`parade`, `opposition`, `conjunction`), locate minimal angular separation across a forecast window, and display results in the UI.

**Independent Test**:
Run `npm run test tests/astronomical_events.spec.ts`. Verify that searching conjunction, opposition, and parade yields correct timestamps and normalized minimal angles `< 180°` in `< 50ms`.

### Tests for User Story 1 ⚠️

- [X] T006 [P] [US1] Write unit tests in `tests/astronomical_events.spec.ts` for `conjunction` calculation (e.g., Earth & Mars within 800 days) verifying precision within 0.1 days and 0.1 degrees
- [X] T007 [P] [US1] Write unit tests in `tests/astronomical_events.spec.ts` for `opposition` calculation (e.g., Earth & Jupiter within 400 days)
- [X] T008 [P] [US1] Write unit tests in `tests/astronomical_events.spec.ts` for planetary `parade` calculation across 3+ planets (e.g., Earth, Mars, Venus)
- [X] T009 [P] [US1] Write benchmark test in `tests/astronomical_events.spec.ts` ensuring 365-day search completes in < 50ms (SC-001)

### Implementation for User Story 1

- [X] T010 [US1] Implement numerical coarse-to-fine search algorithm `findAstronomicalEvent` in `src/core/astronomicalEvents.ts` for `conjunction`, `opposition`, and `parade` without DOM or framework dependencies
- [X] T011 [US1] Create the UI panel component `src/components/AstronomicalEventsPanel.vue` with glassmorphic styling, event selector (`parade`, `opposition`, `conjunction`), planet checkboxes, time range inputs, and Search action
- [X] T012 [US1] Implement state transitions (`Idle` -> `Calculating` -> `Success`) in `src/components/AstronomicalEventsPanel.vue` with disabled form controls during search and target date/angle display upon `FOUND`
- [X] T013 [US1] Integrate `AstronomicalEventsPanel.vue` into `src/components/CanvasViewport.vue` with a toggle button in the top navigation bar

**Checkpoint**: User Story 1 complete and independently testable. MVP functional.

---

## Phase 4: User Story 2 - Jump Simulation Time to Discovered Event (Priority: P2)

**Goal**: Allow users to click "Fast-forward to Date" in `Success` state to jump the 3D simulation to the exact target event timestamp.

**Independent Test**:
In `AstronomicalEventsPanel.vue`, clicking the jump button in `Success` state emits `time-jump` with the target timestamp/date; button remains disabled/hidden in all other states. In `CanvasViewport.vue`, the 3D scene advances to the event timestamp.

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Write unit tests in `tests/astronomical_events.spec.ts` validating timestamp to ISO date conversion `targetDate`

### Implementation for User Story 2

- [X] T015 [US2] Add `time-jump` emission handling and "Fast-forward to Date" button in `src/components/AstronomicalEventsPanel.vue` (enabled strictly in `Success` state)
- [X] T016 [US2] Implement simulation time jump method `jumpToTime(targetTimeDays: number)` in `src/core/SolarScene.ts` to reposition planets to the calculated moment
- [X] T017 [US2] Wire `time-jump` event from `AstronomicalEventsPanel.vue` to `SolarScene` instance in `src/components/CanvasViewport.vue`

**Checkpoint**: User Stories 1 and 2 work seamlessly together.

---

## Phase 5: User Story 3 - Comprehensive Validation and Graceful Unmet Search Handling (Priority: P3)

**Goal**: Gracefully handle unmet searches (`Empty` state) and typed validation errors (`Error` state) with localized Russian messages and retry capability.

**Independent Test**:
Trigger searches with < 2 planets, invalid ranges (`> 36500` or `<= 0`), and empty forecast windows; verify typed `errorCode` returned and corresponding `Empty` and `Error` UI states render without exceptions.

### Tests for User Story 3 ⚠️

- [X] T018 [P] [US3] Write unit tests in `tests/astronomical_events.spec.ts` verifying all `ValidationErrorCode` cases (`INVALID_PLANET_COUNT`, `RANGE_EXCEEDED`, `INVALID_PLANET_ID`, `INVALID_TIME_RANGE`)
- [X] T019 [P] [US3] Write unit tests in `tests/astronomical_events.spec.ts` for `NOT_FOUND` status when threshold is not reached

### Implementation for User Story 3

- [X] T020 [US3] Add Russian error message mapping table for all `ValidationErrorCode` entries in `src/components/AstronomicalEventsPanel.vue`
- [X] T021 [US3] Implement `Empty` state UI view with recommendation to expand search range in `src/components/AstronomicalEventsPanel.vue`
- [X] T022 [US3] Implement `Error` state UI view with localized error badge and "Retry" button in `src/components/AstronomicalEventsPanel.vue`

**Checkpoint**: All edge cases, validations, and states handled cleanly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification, typechecks, linter checks, and code quality adherence

- [X] T023 [P] Verify pure library constraints in `src/core/astronomicalEvents.ts` (0 imports from `vue`, `three`, `document`, `window`)
- [X] T024 Run full project verification suite with `npm run test` and `npm run typecheck`
- [X] T025 Run repository verification script `sh scripts/check.sh`
- [X] T026 Execute validation scenarios outlined in `specs/002-planetary-events-planner/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — executes immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 — MVP delivery.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (`Success` state output needed for jump action).
- **User Story 3 (Phase 5)**: Depends on Phase 2 & 3 (refines error and empty branches).
- **Polish (Phase 6)**: Depends on completion of all stories.

### User Story Dependencies
```text
Phase 1: Setup
    ↓
Phase 2: Foundational (Types & Core Validation)
    ↓
Phase 3: User Story 1 (P1 - Configure & Search Events) [MVP]
    ↓
Phase 4: User Story 2 (P2 - Jump Simulation Time)
    ↓
Phase 5: User Story 3 (P3 - Error & Empty States)
    ↓
Phase 6: Polish & Verification
```

### Parallel Opportunities
- In Phase 1: `T002` can run immediately.
- In Phase 2: `T005` can run in parallel with `T004`.
- In Phase 3 (US1): Test tasks `T006`, `T007`, `T008`, `T009` can be authored in parallel before implementation.
- In Phase 4 (US2): Test task `T014` runs in parallel with UI/Scene updates.
- In Phase 5 (US3): Test tasks `T018`, `T019` run in parallel.
- In Phase 6: `T023` can be verified in parallel with checks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational types and math helpers).
2. Complete Phase 3 (US1 Tests -> `findAstronomicalEvent` -> `AstronomicalEventsPanel.vue` basic search).
3. Validate US1 independently with Vitest: verify astronomical search runs in < 50ms and accurately finds alignments.

### Incremental Delivery
1. Foundation complete (`src/core/astronomicalEvents.ts` types and validator).
2. Deliver US1 (Event search & calculation UI).
3. Deliver US2 (Time jump integration into 3D scene).
4. Deliver US3 (Error and Empty states with Russian localization).
5. Run full verification with `sh scripts/check.sh`.
