# Feature Specification: Planetary Events Planner (Core Logic)

**Feature Branch**: `002-planetary-events-planner`

**Created**: 2026-10-28

**Status**: Draft

**Input**: User description: "Мы — Команда 2 (Core Logic / Backend). Фича: \"planetary-events-planner\". Сфокусируйся строго на математической модели и алгоритмах: - Модуль src/core/astronomicalEvents.ts: поиск локального минимума угловой разности орбит по времени. - Интерфейсы TypeScript: типы событий, параметры поиска (EventSearchParams), результат (EventSearchResult). - Граничные условия: ошибки валидации (INVALID_PLANET_COUNT, RANGE_EXCEEDED), статус ненахождения события. - Никакого DOM, стилей и Vue-разметки — только чистая логика и структуры данных."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate Local Minimum of Orbital Angular Difference (Priority: P1)

As an astronomical simulation consumer or planner engine, I want to compute the exact future point in time when two celestial bodies reach their minimum angular separation (opposition or conjunction) or when a group of bodies forms an optimal alignment (planetary parade), so that the simulation can predict alignment dates with mathematical precision.

**Why this priority**: Core algorithmic value. Finding when orbits minimize their angular difference across time is the mathematical foundation of all planetary event predictions.

**Independent Test**: Can be executed entirely as unit tests on the pure mathematical function with deterministic input angles and orbital periods, verifying that the returned timestamp corresponds to the true local minimum of angular difference within a given tolerance.

**Acceptance Scenarios**:

1. **Given** two valid celestial bodies (e.g., Earth and Mars), their orbital parameters, and a positive search window, **When** searching for an opposition or conjunction event, **Then** the algorithm finds the local minimum of their angular difference, returning the relative timestamp `t` and the minimal angular difference in degrees.
2. **Given** three or more valid celestial bodies (e.g., Mercury, Venus, Earth), **When** searching for a planetary parade event, **Then** the algorithm evaluates angular dispersion across the group over time and identifies the local minimum where bodies are most closely aligned within the specified time window.

---

### User Story 2 - Comprehensive Boundary and Validation Enforcement (Priority: P2)

As a consumer of the astronomical events API, I want clear, typed validation errors when search queries violate physical or computational constraints, so that invalid searches fail fast with descriptive diagnostic codes.

**Why this priority**: Prevents runaway calculation loops, invalid physical queries (e.g., 0 or 1 planet), or unreasonable forecasting windows.

**Independent Test**: Can be tested by invoking search functions with invalid parameters (fewer than required planets, non-existent planet IDs, range exceeding allowable limits, negative or zero step intervals) and verifying that specific, structured errors (e.g., `INVALID_PLANET_COUNT`, `RANGE_EXCEEDED`, `INVALID_PLANET_ID`) are returned.

**Acceptance Scenarios**:

1. **Given** search parameters containing fewer than 2 distinct planet identifiers, **When** search is initiated, **Then** the algorithm rejects the query with an `INVALID_PLANET_COUNT` error code without performing numerical calculations.
2. **Given** a requested forecast range exceeding the maximum configured threshold (e.g., > 36,500 days), **When** search is initiated, **Then** the algorithm rejects the query with a `RANGE_EXCEEDED` error code.

---

### User Story 3 - Graceful Handling of Unmet Event Criteria (Priority: P3)

As a consumer of the astronomical calculation results, I want a structured result indicating when no qualifying astronomical event occurred within the chosen timeframe, so that the calling system can distinguish between a calculation failure and the genuine astronomical absence of an event.

**Why this priority**: In astronomy, rare alignments often do not happen in short intervals. Callers need an explicit non-error status when no event satisfies the alignment threshold.

**Independent Test**: Can be tested by requesting an alignment search with a narrow threshold over a short time window where no convergence occurs, verifying the returned result has a status of `NOT_FOUND` (or `found: false`) along with inspected range details, rather than throwing an exception.

**Acceptance Scenarios**:

1. **Given** a valid event search request over a time window where planets do not converge within the acceptable angular threshold, **When** the search algorithm completes, **Then** the algorithm returns a structured result with status `NOT_FOUND`, including the evaluated time range and the closest minimum angle achieved.
2. **Given** an event that successfully converges within the requested threshold, **When** the search algorithm completes, **Then** the algorithm returns status `FOUND` with the target timestamp, exact minimum angular difference, and participating bodies.

---

### Edge Cases

- **Identical Planet IDs in Request**: Input contains duplicate entries for the same planet (e.g., `['mars', 'mars']`). System rejects with `INVALID_PLANET_COUNT` or deduplicates strictly before validation.
- **Planets Moving at Nearly Equal Angular Speeds**: In hypothetical or custom scenarios where speed difference is zero, no convergence occurs. Algorithm terminates without infinite looping and reports `NOT_FOUND`.
- **Search Range Spanning Boundary Conditions**: The search range starts exactly at `t = 0` or ends at the maximum allowable bound `t = maxDays`. Bounds checking must be inclusive and non-overflowing.
- **Local Minimum at the Very Boundary**: The minimum angular difference occurs at `t = 0` or `t = end`. The algorithm accurately records boundary extrema while prioritizing true internal local minima if configured.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement an astronomical event calculation module (`src/core/astronomicalEvents.ts`) that operates as a pure TypeScript library without dependencies on DOM, browser APIs, or UI frameworks.
- **FR-002**: The system MUST define explicit TypeScript types and data structures:
  - `EventType`: supporting at least `conjunction`, `opposition`, and `parade`.
  - `EventSearchParams`: defining input parameters including event type, array of celestial body identifiers (`planetIds`), start time `startTime` (days or timestamp), `timeRangeDays` (forecast range in days), and optional numerical step/tolerance parameters.
  - `EventSearchResult`: defining the output containing status (`FOUND` | `NOT_FOUND` | error), target timestamp/time offset, minimal angular difference (in degrees and/or radians), evaluated planet IDs, and diagnostic details.
- **FR-003**: The calculation algorithm MUST locate the local minimum of orbital angular difference across time using an efficient numerical or analytical minimization approach.
- **FR-004**: The system MUST perform strict input validation and return explicit, typed error codes:
  - `INVALID_PLANET_COUNT`: when fewer than 2 valid planets are supplied for conjunction/opposition or fewer than 3 for parade.
  - `RANGE_EXCEEDED`: when `timeRangeDays` exceeds the maximum allowed computational range (e.g., > 36,500 days).
  - `INVALID_PLANET_ID`: when any supplied planet identifier is not recognized in the celestial database.
  - `INVALID_TIME_RANGE`: when `timeRangeDays` is negative, zero, or non-finite.
- **FR-005**: If no local minimum meets the event criteria within the specified search window, the system MUST return an `EventSearchResult` with status `NOT_FOUND` without throwing an unhandled exception.
- **FR-006**: The algorithm MUST normalize all angular calculations and differences to the range `[0, π]` radians (or `[0, 180]` degrees) to prevent periodic phase jumps or wrap-around artifacts.
- **FR-007**: The calculation module MUST be completely decoupled from Vue reactivity and Three.js scene graphs, operating exclusively on numbers, strings, and plain data objects.

### Key Entities

- **EventSearchParams**: Input parameters for astronomical event query:
  - `eventType`: `EventType` (`'conjunction'` | `'opposition'` | `'parade'`)
  - `planetIds`: `string[]` (list of celestial body IDs participating in the event)
  - `startTime`: `number` (starting simulation time offset in days)
  - `timeRangeDays`: `number` (forecast duration in days, positive integer)
  - `angularThresholdDeg`?: `number` (maximum angular separation in degrees to qualify as an event)
  - `stepDays`?: `number` (coarse stepping interval for scan phase)
- **EventSearchResult**: Result contract produced by the planner engine:
  - `status`: `'FOUND'` | `'NOT_FOUND'` | `'ERROR'`
  - `time`: `number | null` (time offset in days from start when the minimum occurs, if found)
  - `minAngularDifferenceDeg`: `number` (the minimal angular separation observed)
  - `eventType`: `EventType`
  - `participatingPlanets`: `string[]`
  - `errorCode`?: `string` (e.g., `'INVALID_PLANET_COUNT'`, `'RANGE_EXCEEDED'`, `'INVALID_PLANET_ID'`, `'INVALID_TIME_RANGE'`)
  - `errorMessage`?: `string` (human-readable diagnostic description)
- **ValidationErrorCode**: Standardized error constants (`INVALID_PLANET_COUNT`, `RANGE_EXCEEDED`, `INVALID_PLANET_ID`, `INVALID_TIME_RANGE`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Single-event search execution completes within less than 50ms for a 365-day search window under standard benchmark environments.
- **SC-002**: Minimal angular difference and corresponding timestamp calculations achieve a precision within 0.1 degrees and 0.1 days of analytical reference solutions.
- **SC-003**: 100% of invalid parameter inputs (e.g., planet count < 2, range > 36,500 days, unknown planet IDs) are caught and mapped to standard error codes without throwing uncaught exceptions.
- **SC-004**: Unit test coverage for core event calculation algorithms and edge cases reaches at least 95%.
- **SC-005**: The core calculation module contains zero DOM or framework imports (`vue`, `three`, `document`, `window`).

## Assumptions

- Orbital parameters (orbital periods, base speeds) are sourced from the existing `src/data/celestialBodies.ts` or compatible orbital calculator models.
- Planar orbital approximations (circular/coplanar orbits on the XZ plane) as defined in `OrbitCalculator` are valid for determining angular alignment and opposition.
- Time is tracked in continuous units of earth days or scaled simulation seconds, maintaining consistency with existing `OrbitCalculator` conventions.
- The maximum acceptable forecast range is 36,500 days (100 Earth years) to prevent CPU resource exhaustion.
