# Implementation Plan: Planetary Events Planner

**Branch**: `002-planetary-events-planner` | **Date**: 2026-10-28 | **Spec**: [specs/002-planetary-events-planner/spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-planetary-events-planner/spec.md` and unified contract [docs/specs/CONTRACT.md](../../docs/specs/CONTRACT.md).

## Summary

Implement an astronomical events forecasting engine and interactive UI panel for the 3D Solar System simulation. The system allows users to search for upcoming planetary alignments (`parade`, `opposition`, `conjunction`) across customizable forecast time windows, visualize minimal angular differences, and jump simulation time to the calculated event timestamp.

The core computational logic (`src/core/astronomicalEvents.ts`) will be implemented as a pure, zero-dependency TypeScript engine using coarse-to-fine numerical minimization. The user interface (`src/components/AstronomicalEventsPanel.vue`) provides a Sci-Fi glassmorphism overlay supporting strict 5-state lifecycle management (`Idle`, `Calculating`, `Success`, `Empty`, `Error`) and full integration with the 3D simulation clock.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 / ES2022

**Primary Dependencies**: Vue 3 (`vue@^3.5.42`), Three.js (`three@^0.186.1`), Vite (`vite@^8.3.0`)

**Storage**: N/A (Client-side in-memory reactive state and deterministic mathematical calculations)

**Testing**: Vitest (`vitest@^5.0.3`), Playwright (E2E)

**Target Platform**: Modern Web Browsers (WebGL 2.0 capable)

**Project Type**: Web Application (Vue 3 Single Page Application with Three.js canvas)

**Performance Goals**:
- Core calculation execution < 50ms for a 365-day forecast window (SC-001)
- Timestamp and angular precision within 0.1 days and 0.1 degrees (SC-002)
- Zero layout shift during UI state transitions (SC-004)

**Constraints**:
- Pure TypeScript implementation for `src/core/astronomicalEvents.ts` with zero DOM or framework imports (FR-001, SC-007)
- Normalized angular outputs within `[0, 180]` degrees (FR-005)
- Full adherence to unified contracts in `docs/specs/CONTRACT.md` (FR-003)

**Scale/Scope**:
- 8 planets + Sun orbital modeling
- 3 event types (`parade`, `opposition`, `conjunction`)
- Search windows up to 36,500 days (100 years)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Rule 1 (Three.js Isolation)**: `AstronomicalEventsPanel` is a Vue component communicating via props and events (`search`, `time-jump`). Three.js objects remain isolated in `SolarScene.ts` and `OrbitCalculator.ts`. No Three.js objects wrapped in Vue reactive state. (PASS)
- **Rule 2 (Zero-dependency Core Module)**: `astronomicalEvents.ts` contains 0 imports from Vue, Three.js, or DOM. (PASS)
- **Rule 3 (Constant Single Source of Truth)**: All planet identifiers, orbital periods, and physical properties originate from `src/data/celestialBodies.ts`. (PASS)
- **Rule 4 (Full Validation & Type Safety)**: Strict TypeScript checking with `vue-tsc --noEmit` and full check runner `sh scripts/check.sh`. (PASS)

## Project Structure

### Documentation (this feature)

```text
specs/002-planetary-events-planner/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 research & technical decisions
├── data-model.md        # Phase 1 data model & validation rules
├── quickstart.md        # Phase 1 validation scenarios
└── contracts/           # Phase 1 interface contracts
    ├── calculation-contract.md
    └── ui-contract.md
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── OrbitCalculator.ts         # Orbital mechanics & angles
│   ├── SolarScene.ts              # 3D Scene & simulation loop
│   └── astronomicalEvents.ts      # [NEW] Pure calculation engine
├── components/
│   ├── AstronomicalEventsPanel.vue # [NEW] Sci-Fi planner UI panel
│   ├── CanvasViewport.vue         # Main viewport & overlay container
│   ├── PlanetCard.vue             # Selected planet details
│   └── TimeControls.vue           # Time speed & play controls
├── data/
│   └── celestialBodies.ts         # Single source of truth for planetary data
tests/
├── astronomical_events.spec.ts    # [NEW] Unit tests for event calculations
└── orbit_math.spec.ts             # Orbital tests
```

**Structure Decision**: Single project modular layout adhering to existing conventions and style guide. The calculation engine is located in `src/core/astronomicalEvents.ts` and the UI overlay is placed in `src/components/AstronomicalEventsPanel.vue`.

## Complexity Tracking

*No violations or unnecessary complexity detected. Conforms to all constitutional requirements.*
