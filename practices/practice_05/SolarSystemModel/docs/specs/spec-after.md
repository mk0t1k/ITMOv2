# Feature Specification: Planetary Events Planner

**Feature Branch**: `002-planetary-events-planner`

**Created**: 2026-10-28

**Status**: Draft (Agreed)

**Unified Contract Reference**: [CONTRACT.md](../../docs/specs/CONTRACT.md)

**Input**: Согласованная спецификация на базе требований UI (`docs/specs/ui-before.md`) и Core Logic (`docs/specs/backend-before.md`).

---

## 1. User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and Search Astronomical Events (Priority: P1)

As a space enthusiast or researcher exploring the solar system, I want to select an astronomical event type (planetary parade, opposition, conjunction), choose participating celestial bodies and a forecast time window, and initiate a search so that I can see when the next event occurs with exact date and minimal angular difference.

- **Acceptance Scenario 1.1 (Idle to Calculating)**:
  Given the planner panel is open in `Idle` state, When the user selects valid event parameters (`eventType`, `planetIds`, `timeRangeDays`) and clicks "Find Event", Then the UI transitions to `Calculating` state, inputs are disabled, and `EventSearchParams` is submitted to the calculation engine.
- **Acceptance Scenario 1.2 (Found / Success)**:
  Given calculation finds an event within the threshold, When the calculation completes with status `FOUND`, Then the panel transitions to `Success` state displaying the target event date, participating planets, calculated minimal angular difference (in degrees, [0, 180]), and enables the "Fast-forward to Date" action.

---

### User Story 2 - Jump Simulation Time to Discovered Event (Priority: P2)

As a user examining an identified astronomical event, I want to click a button to fast-forward the solar system simulation directly to the event's forecasted timestamp so that I can immediately observe the celestial body alignment in the 3D scene.

- **Acceptance Scenario 2.1 (Time Jump Request)**:
  Given an event was found and displayed in `Success` state, When the user clicks "Fast-forward to Date", Then the component emits a `time-jump` event with the target time offset and date string, triggering `useSolarSimulation` time update.
- **Acceptance Scenario 2.2 (Disabled in non-Success states)**:
  Given the panel is in `Idle`, `Calculating`, `Empty`, or `Error` state, Then the fast-forward button is disabled or hidden.

---

### User Story 3 - Comprehensive Validation and Graceful Unmet Search Handling (Priority: P3)

As a user or consumer system, I want explicit visual and typed error feedback when input parameters are invalid, and a clean Empty state when no event occurs within the forecast period, so that failures are clearly distinguished from astronomical absence.

- **Acceptance Scenario 3.1 (Unmet event criteria / Empty state)**:
  Given valid parameters over a time window where bodies do not reach the alignment threshold, When calculation finishes, Then the engine returns `status: 'NOT_FOUND'` and the UI enters `Empty` state suggesting expanding the search range.
- **Acceptance Scenario 3.2 (Validation and Error Handling)**:
  Given invalid search parameters (e.g. fewer than 2 planets, range > 36,500 days, invalid planet ID, non-positive range), When search is validated, Then the engine returns `status: 'ERROR'` with a typed `errorCode` (`INVALID_PLANET_COUNT`, `RANGE_EXCEEDED`, `INVALID_PLANET_ID`, `INVALID_TIME_RANGE`), and the UI renders `Error` state with a localized message and a "Retry" action.

---

### Edge Cases

- **Duplicate Planet IDs**: Input containing duplicate IDs is rejected with `INVALID_PLANET_COUNT` or deduplicated strictly.
- **Equal Angular Speeds / No Convergence**: Algorithm terminates without infinite loops and reports `NOT_FOUND`.
- **Search Range Bounds**: Search range handles boundaries (`t = 0` to `t = timeRangeDays`) safely.
- **Concurrent Searches**: Search button remains disabled during `Calculating` state to prevent duplicate calculations.

---

## 2. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement the core calculation module in `src/core/astronomicalEvents.ts` as a pure TypeScript library without dependencies on Vue, Three.js, or DOM.
- **FR-002**: The system MUST implement the user interface component `AstronomicalEventsPanel.vue` adhering to the agreed design and the Sci-Fi glassmorphism theme.
- **FR-003**: All interfaces, data structures, and events MUST conform strictly to [CONTRACT.md](../../docs/specs/CONTRACT.md):
  - `EventType`: `'parade' | 'opposition' | 'conjunction'`.
  - `EventSearchParams`: `eventType`, `planetIds`, `startTime`, `timeRangeDays`, `angularThresholdDeg?`, `stepDays?`.
  - `EventSearchResult`: `status` (`'FOUND' | 'NOT_FOUND' | 'ERROR'`), `eventType`, `participatingPlanets`, `time`, `minAngularDifferenceDeg`, `targetDate?`, `title?`, `errorCode?`, `errorMessage?`.
  - `PlannerUIState`: `'Idle' | 'Calculating' | 'Success' | 'Empty' | 'Error'`.
  - `ValidationErrorCode`: `'INVALID_PLANET_COUNT' | 'RANGE_EXCEEDED' | 'INVALID_PLANET_ID' | 'INVALID_TIME_RANGE'`.
- **FR-004**: The UI component MUST handle all 5 states (`Idle`, `Calculating`, `Success`, `Empty`, `Error`) according to the status mapping table in `CONTRACT.md`.
- **FR-005**: All angular calculations and outputs MUST be normalized to the range `[0, 180]` degrees (`[0, π]` radians).
- **FR-006**: The UI component MUST emit `time-jump` with the target timestamp/date upon user confirmation in `Success` state.
- **FR-007**: Core calculation MUST locate the local minimum of orbital angular difference across time using an efficient numerical or analytical minimization approach.

---

## 3. Success Criteria *(mandatory)*

- **SC-001**: Single-event calculation executes in < 50ms for a 365-day search window.
- **SC-002**: Minimal angular difference and timestamp achieve precision within 0.1 degrees and 0.1 days.
- **SC-003**: 100% of invalid inputs are captured by typed validation error codes without uncaught exceptions.
- **SC-004**: UI state transitions between all 5 states render cleanly without layout shift or flicker.
- **SC-005**: Time fast-forward action dispatches the exact target event timestamp within 1 click upon arriving in `Success` state.
- **SC-006**: Unit test coverage for core event calculation algorithms and edge cases reaches at least 95%.
- **SC-007**: The core calculation module contains zero DOM or framework imports (`vue`, `three`, `document`, `window`).
