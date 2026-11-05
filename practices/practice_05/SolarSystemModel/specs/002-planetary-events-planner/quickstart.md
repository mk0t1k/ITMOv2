# Quickstart Validation Guide: Planetary Events Planner

This guide provides runnable end-to-end scenarios to verify the Planetary Events Planner feature.

## Prerequisites
- Node.js >= 18
- Dependencies installed: `npm install`
- Type checking passes: `npm run typecheck`
- Unit tests pass: `npm run test`

---

## Validation Scenario 1: Unit Test Validation of Astronomical Calculations

Run the dedicated test suite verifying all calculation criteria:

```bash
npm run test tests/astronomical_events.spec.ts
```

### Expected Outcome:
- All test suites pass.
- Conjunction between Earth and Mars within 780 days identifies min angular difference `< 2°`.
- Opposition between Earth and Jupiter within 400 days identifies opposition angle deviation `< 2°`.
- Planetary parade across 3 planets (Earth, Mars, Venus) computes correct minimal sector.
- Boundary & validation checks verify:
  - Error code `INVALID_PLANET_COUNT` when < 2 planets selected.
  - Error code `INVALID_PLANET_COUNT` when < 3 planets selected for parade.
  - Error code `RANGE_EXCEEDED` when `timeRangeDays > 36500`.
  - Error code `INVALID_TIME_RANGE` when `timeRangeDays <= 0`.
- Execution benchmark: single 365-day search completes in `< 50ms`.

---

## Validation Scenario 2: UI Component Rendering and State Transitions

Run component tests:

```bash
npm run test tests/AstronomicalEventsPanel.spec.ts
```

### Expected Outcome:
- Transitions properly through `Idle -> Calculating -> Success`.
- Handles `Idle -> Calculating -> Empty` when no event meets the threshold.
- Handles `Idle -> Calculating -> Error` on parameter invalidation.
- Emits `time-jump` with payload when fast-forward button is clicked in `Success` state.
- Button is disabled in `Idle`, `Calculating`, `Empty`, and `Error` states.

---

## Validation Scenario 3: Interactive Simulation Fast-Forward

1. Start development server:
   ```bash
   npm run dev
   ```
2. Open application in browser (e.g. `http://localhost:5173/`).
3. Open the "Планетарные события" (Planetary Events) panel.
4. Select `Соединение` (Conjunction), choose `Земля` and `Марс`, set search window to `800` days, click "Найти событие".
5. Observe the calculation transitioning to `Success` state showing the target date and angular separation.
6. Click "Перемотать время к дате" (Fast-forward to Date).
7. Verify that planetary orbits align along the calculated conjunction angle in the 3D scene.

---

## Validation Scenario 4: Full Quality Gate Check

Run repository-wide verification script:

```bash
sh scripts/check.sh
```

### Expected Outcome:
- Types pass (`vue-tsc --noEmit`).
- Linters pass.
- Build bundle succeeds (`vite build`).
- All unit and math tests pass.
