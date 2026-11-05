# Phase 0 Research: Planetary Events Planner

## Research Items & Technical Decisions

### Decision 1: Core Calculation Architecture & Zero-Dependency Separation
- **Context / Requirement**: FR-001 & SC-007 require `src/core/astronomicalEvents.ts` to be implemented as a pure TypeScript module without dependencies on Vue, Three.js, or DOM (`document`, `window`).
- **Decision**: Implement `AstronomicalEventsCalculator` as a pure TypeScript class / set of pure functions accepting standard data models (`EventSearchParams`, `CelestialBodyData`).
- **Rationale**:
  - Guarantees 100% testability in standard Node/Vitest environments without mock DOM or WebGL contexts.
  - Ensures clean separation of concerns: mathematical calculations run deterministically regardless of rendering frame rate or UI lifecycles.
  - Execution speed is optimal (well within the < 50ms requirement for a 365-day search window).
- **Alternatives considered**:
  - *Embedding calculation logic into `useSolarSimulation` composable or `SolarScene`*: Rejected because it entangles Three.js render loop state with astronomical predictions and violates FR-001.
  - *Web Worker execution*: Rejected for current initial scope as search across 8 planets for 365–3650 days with adaptive step takes < 5–15ms in pure JS. Can be wrapped seamlessly later without changing interface.

---

### Decision 2: Astronomical Event Detection Algorithm & Optimization
- **Context / Requirement**: Need to detect:
  1. `parade`: Planetary parade (3 or more planets in a narrow angular sector).
  2. `opposition`: Opposition (2 bodies aligned on opposite sides of the Sun/origin, angular difference ~ 180° / relative angle ~ 180°).
  3. `conjunction`: Conjunction (2 bodies having minimal angular separation as seen from the Sun, angular difference ~ 0°).
- **Mathematical Formulation**:
  - In the simplified 2D orbital model on the XZ plane:
    $$\theta_i(t) = (\theta_{0, i} + \omega_i \cdot t) \pmod{2\pi}$$
    where $\omega_i = \text{OrbitCalculator.getAngularSpeed}(T_i)$ or defined relative to simulation time units.
  - **Conjunction (2 bodies)**: $\Delta\theta(t) = \min(|\theta_1(t) - \theta_2(t)|, 2\pi - |\theta_1(t) - \theta_2(t)|)$. Conjunction occurs when $\Delta\theta(t) \to 0^\circ$.
  - **Opposition (2 bodies)**: $\Delta\theta_{opp}(t) = |180^\circ - \Delta\theta(t)|$ or normalized difference from $\pi$. Opposition occurs when the relative angle between two planets relative to the Sun is $180^\circ$ (or when planet 2 is opposite planet 1 from the viewpoint of Earth/Sun). Following the contract: minimum angular difference from the opposition alignment ($|180^\circ - \text{angle}| \to 0$ or angular difference between the position vectors and opposite direction).
  - **Parade ($\ge 3$ bodies)**: Minimal angular sector covering all selected planets $\min_{\text{perm}} (\text{span}(\theta_1, \dots, \theta_k))$. For a set of sorted angles around a circle, the minimal arc containing all points is $360^\circ - \text{max\_gap}$.
- **Numerical Search Method**:
  - **Coarse scan**: Step through $t \in [t_{\text{start}}, t_{\text{start}} + \text{timeRangeDays}]$ with coarse step (e.g. `stepDays = 1.0` or dynamic based on fastest planet's period $\approx T_{\min} / 8$).
  - **Candidate isolation**: When objective function $f(t)$ reaches a local minimum below or approaching threshold, bracket the interval $[t - \Delta t, t + \Delta t]$.
  - **Fine refinement**: Golden section search or Brent's minimization / parabolic interpolation to converge to $< 0.1$ days and $< 0.1^\circ$ precision within 10 iterations.
- **Rationale**:
  - Provides guaranteed convergence without numerical instability.
  - Extremely fast execution ($O(N \cdot \text{steps})$ where $N \le 8$).
- **Alternatives considered**:
  - *Analytical solution for all pairs*: While 2 bodies with constant circular angular speeds can be solved analytically via linear modular congruences ($\Delta\omega \cdot t = \Delta\theta_0 + 2\pi k$), the planetary parade with $\ge 3$ bodies is an NP-hard geometric clustering problem across continuous time; numerical coarse-to-fine minimization provides a unified solver for all three event types.

---

### Decision 3: Angle Normalization & Threshold Defaults
- **Context / Requirement**: FR-005 dictates all angular outputs MUST be normalized to $[0, 180]$ degrees ($[0, \pi]$ radians).
- **Decision**:
  - Conjunction target metric: angular difference in $[0, 180]^\circ$. Threshold default: $10^\circ$.
  - Opposition target metric: angular deviation from exact opposition ($|180^\circ - \text{angular distance}| \in [0, 180]^\circ$). Threshold default: $10^\circ$.
  - Parade target metric: span of sector containing all bodies. Normalized to $[0, 180]^\circ$ (if planets span $> 180^\circ$, it does not qualify as parade). Threshold default: $30^\circ$ (or user-specified).
- **Rationale**: Direct compliance with CONTRACT.md and FR-005.

---

### Decision 4: UI Architecture & State Machine
- **Context / Requirement**: FR-002, FR-004, CONTRACT.md define 5 strict UI states: `Idle`, `Calculating`, `Success`, `Empty`, `Error`.
- **Decision**:
  - Implement `AstronomicalEventsPanel.vue` as a floating glassmorphic panel matching `PlanetCard.vue` and `TimeControls.vue`.
  - Maintain an explicit reactive state enum: `'Idle' | 'Calculating' | 'Success' | 'Empty' | 'Error'`.
  - Provide complete accessibility, keyboard support, disabled state during calculation, error messaging mapped to Russian localization as per CONTRACT.md section 3.2.
- **Rationale**: Prevents unexpected state transitions, provides smooth UX without layout shifts.

---

### Decision 5: Date Calculation & Time Jump Integration
- **Context / Requirement**: The simulation starts from an epoch or relative days. Fast-forwarding needs both a relative offset and an ISO formatted date.
- **Decision**:
  - Base simulation epoch: Current Earth date / standard epoch (e.g., `2026-10-28T00:00:00Z` or `Date.now()`).
  - `targetDate` string: Computed as `new Date(baseEpochMs + timeOffsetDays * 86400000).toISOString()`.
  - Emitted `time-jump`: Emits `{ targetTime: number, targetDate: string }` or `targetTime` offset so the scene or composable can advance its clock and update planetary positions to the exact calculated moment.
- **Rationale**: Fully meets Acceptance Scenario 2.1 and CONTRACT.md Section 4.
