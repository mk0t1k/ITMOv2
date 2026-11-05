# Feature Specification: Planetary Events Planner

**Feature Branch**: `001-planetary-events-planner`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "Мы — Команда 1 (Frontend / UI). Фича: \"planetary-events-planner\" (Планировщик парада планет и противостояний). Сфокусируйся строго на интерфейсе: - Компонент AstronomicalEventsPanel.vue: дропдаун выбора события, диапазон дней, кнопка поиска, вывод даты и угла, кнопка перемотки времени. - Состояния: Idle, Calculating, Success, Empty (не найдено), Error. - Никакой внутренней математики орбит, только интерфейсные контракты и UI-поведение."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search and View Astronomical Events (Priority: P1)

As a space enthusiast or researcher exploring the solar system, I want to select an astronomical event type, choose a forecast time window, and trigger a search so that I can see when the next parade or planetary opposition occurs, along with its calculated date and alignment angle.

**Why this priority**: Core value of the planner interface. Without selecting parameters, triggering search, and viewing the resulting event date and angle, the feature cannot function.

**Independent Test**: Can be tested completely in isolation from 3D physics by providing mock search results or a calculation contract: user picks event parameters, clicks search, observes the loading/calculating transition, and verifies the rendered date and angular difference.

**Acceptance Scenarios**:

1. **Given** the planner panel is open in its default/initial state (Idle), **When** the user selects an event type (e.g., "Great Parade of Planets" or "Mars Opposition") and a search range in days, and clicks "Find Event", **Then** the panel transitions to the Calculating state displaying a loading indicator and disabling search inputs.
2. **Given** the search calculation completes with a valid occurrence, **When** the panel enters the Success state, **Then** it displays the target event details, the forecasted date/timestamp, the angular alignment metric (in degrees), and an enabled "Fast-forward to Date" action button.

---

### User Story 2 - Jump Simulation Time to Discovered Event (Priority: P2)

As a user examining an identified astronomical event, I want to click a dedicated button to fast-forward the solar system simulation directly to the event's forecasted date so that I can immediately observe the celestial body alignment in the 3D scene.

**Why this priority**: Connects the UI planning panel with the overall user journey of visualizing planetary configurations without forcing manual timeline scrubbing.

**Independent Test**: Can be tested by triggering the "Fast-forward to Date" button in a Success state and verifying that an external action/event with the target timestamp is dispatched to the simulation controller, accompanied by visual confirmation/feedback.

**Acceptance Scenarios**:

1. **Given** an event was found and displayed in the Success state, **When** the user clicks "Fast-forward to Date", **Then** the component emits a request to fast-forward simulation time with the precise target date, and provides visual confirmation (e.g., active highlight or confirmation label).
2. **Given** the panel is in Idle, Calculating, Empty, or Error state, **When** the user inspects the panel, **Then** the fast-forward time button is either disabled or hidden to prevent invalid time jumps.

---

### User Story 3 - Visual Feedback for Unmet Searches and Calculation Failures (Priority: P3)

As a user configuring search parameters, I want clear, distinct visual states when no events fall within the selected day range or when calculation fails, so that I understand why results are not displayed and can adjust my search query.

**Why this priority**: Essential for resilient UX and boundary handling. Users must know if a parade is simply absent in the window or if a system error occurred.

**Independent Test**: Can be tested by feeding empty or error responses: panel clearly differentiates Empty ("No events found in selected period") from Error ("Failed to compute astronomical positions") with retry options.

**Acceptance Scenarios**:

1. **Given** the user triggers a search for a narrow day range where no alignment criteria are met, **When** the search finishes with no matching events, **Then** the panel transitions to the Empty state with an informative message suggesting expanding the search range.
2. **Given** a computation or data fetch error occurs during calculation, **When** calculation fails, **Then** the panel transitions to the Error state presenting an error summary and an enabled "Retry" action.

---

### Edge Cases

- **Negative or Zero Day Range**: User enters a non-positive or non-numeric range value; the UI prevents triggering the search and displays an inline input validation warning.
- **Triggering Search While Calculating**: User attempts to submit another search while a calculation is already running; the UI keeps the search trigger disabled until resolution or cancellation.
- **Very Large Forecast Window**: User enters an exceptionally large range (e.g., > 36,500 days / 100 years); the UI provides a boundary cap or indicator that computation might take longer.
- **Time Jump When Simulation is Paused/Active**: Fast-forwarding time requests should work consistently whether the current simulation playback is paused or playing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an astronomical events planner panel component with an event selection dropdown supporting at least two event categories: planetary parade (alignment) and planetary opposition.
- **FR-002**: The system MUST provide an input to specify the forecast range in days (with a reasonable default, e.g., 30 to 365 days).
- **FR-003**: The system MUST provide a search action button that triggers the calculation for the chosen event type and day range.
- **FR-004**: The system MUST explicitly manage and visually reflect five distinct lifecycle states:
  - `Idle`: initial state awaiting user input and search action.
  - `Calculating`: calculation in progress, displaying progress/spinner and disabling concurrent search triggers.
  - `Success`: event successfully identified, showing calculated date, angle deviation, and time jump action.
  - `Empty`: calculation finished with no events found within the range, showing actionable guidance to expand the range.
  - `Error`: calculation or service failure, displaying an error message and a retry action.
- **FR-005**: In the `Success` state, the panel MUST display the calculated event date (formatted in human-readable date/time) and the alignment angle (degrees with decimal precision).
- **FR-006**: In the `Success` state, the panel MUST offer a time fast-forward action button ("Rewind / Fast-forward to Event") that emits an intent with the target timestamp to the parent simulation.
- **FR-007**: The panel MUST decouple all UI interactions and states from internal celestial math, interacting strictly via clean data contracts (props/events or reactive composable state).

### Key Entities

- **AstronomicalEventQuery**: Represents user-specified search parameters:
  - `eventType`: string/enum identifier (`planetary-parade` | `opposition`).
  - `targetBodies`: list of selected celestial bodies involved (optional or contextual based on event).
  - `rangeInDays`: positive integer indicating days forward from current simulation time.
- **AstronomicalEventResult**: Represents calculation result contract consumed by UI:
  - `id`: unique identifier of the event.
  - `title`: human-readable event title.
  - `date`: standard ISO date string or timestamp.
  - `angleDegrees`: calculated alignment deviation or opposition angle (number).
  - `description`: brief summary of which bodies participate and their alignment quality.
- **PlannerUIState**: The UI display state enum: `Idle`, `Calculating`, `Success`, `Empty`, `Error`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure parameters and trigger an astronomical event search in under 3 clicks or 10 seconds.
- **SC-002**: UI state transitions between all 5 states (`Idle`, `Calculating`, `Success`, `Empty`, `Error`) render without UI flicker or layout breakage.
- **SC-003**: When entering the `Success` state, the calculated date and angle are legibly presented with 100% adherence to defined typography and sci-fi aesthetic guidelines.
- **SC-004**: Fast-forward action dispatches the exact target event timestamp within 1 click upon arriving in the `Success` state.

## Assumptions

- Orbital calculations and mathematical search algorithms are handled by an external service/composable or calculation worker, completely independent of the Vue panel component.
- The component will be styled in alignment with the existing Sci-Fi glassmorphism theme used in the Solar System project.
- Time jump requests are received by the global simulation time composable (`useSolarSimulation`), which handles updating current simulation time.
- Standard browser locale or ISO format is acceptable for displaying the projected event date.
