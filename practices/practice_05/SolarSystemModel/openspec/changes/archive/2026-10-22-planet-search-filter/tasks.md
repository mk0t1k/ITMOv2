# Tasks

## 1. Search Logic and Unit Tests

- [x] 1.1 Implement pure filtering function for celestial bodies (matching Russian and English names, case-insensitive, handling empty queries and trimming) in a dedicated helper or composable and verify unit tests with Vitest (`npm run test`)
- [x] 1.2 Write unit tests in `tests/search_filter.spec.ts` covering exact, partial, mixed-case, empty queries, and no-match scenarios, and verify they pass (`npm run test`)

## 2. UI Search Input and Navigation Integration

- [x] 2.1 Integrate the search input component/elements into `CanvasViewport.vue` navigation bar with Sci-Fi styling matching the design guide
- [x] 2.2 Implement real-time list filtering of visible celestial buttons in the navigation bar and verify that typing filters celestial bodies instantly
- [x] 2.3 Implement Enter key autofocus: pressing Enter on search input triggers selection and camera focus on the top matched body, verified by manual/unit checks
- [x] 2.4 Add clear query functionality (clear button and Escape key handling) and empty-state messaging when no celestial bodies match

## 3. Verification and Validation

- [x] 3.1 Verify orbital motion, camera transitions, and time controls (`TimeControls.vue`) remain active and unaffected during and after search interactions
- [x] 3.2 Run full project validation (`sh scripts/check.sh` / `npm run check`) ensuring TypeScript typecheck, linting, build, and tests succeed with zero errors
