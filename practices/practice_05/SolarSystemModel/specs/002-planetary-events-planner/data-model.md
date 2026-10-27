# Data Model: Planetary Events Planner

## Entities & Type Definitions

Conforms to [CONTRACT.md](../../docs/specs/CONTRACT.md).

### 1. `EventType`
Enum-like union representing the type of astronomical alignment.
```typescript
export type EventType = 'parade' | 'opposition' | 'conjunction'
```

### 2. `ValidationErrorCode`
Typed validation codes returned when input parameters violate constraints.
```typescript
export type ValidationErrorCode =
  | 'INVALID_PLANET_COUNT'
  | 'RANGE_EXCEEDED'
  | 'INVALID_PLANET_ID'
  | 'INVALID_TIME_RANGE'
```

### 3. `EventSearchStatus`
Execution outcome status returned by the core calculation engine.
```typescript
export type EventSearchStatus = 'FOUND' | 'NOT_FOUND' | 'ERROR'
```

### 4. `PlannerUIState`
Component UI state machine states.
```typescript
export type PlannerUIState = 'Idle' | 'Calculating' | 'Success' | 'Empty' | 'Error'
```

### 5. `EventSearchParams`
Query payload submitted to initiate event search.
```typescript
export interface EventSearchParams {
  eventType: EventType
  planetIds: string[]
  startTime: number
  timeRangeDays: number
  angularThresholdDeg?: number
  stepDays?: number
}
```

#### Validation Rules for `EventSearchParams`
- `planetIds`:
  - Must not be empty.
  - No duplicate values allowed.
  - Every ID must exist in `celestialBodies.ts` (e.g. `PLANETS_DATA.some(p => p.id === id)`).
  - For `opposition` and `conjunction`: length must be at least 2 (default/recommended exactly 2).
  - For `parade`: length must be at least 3.
  - If violated: `errorCode = 'INVALID_PLANET_COUNT'` or `'INVALID_PLANET_ID'`.
- `timeRangeDays`:
  - Must be a finite number `> 0`. If `<= 0` or NaN: `errorCode = 'INVALID_TIME_RANGE'`.
  - Must be `<= 36500` (100 years). If `> 36500`: `errorCode = 'RANGE_EXCEEDED'`.
- `startTime`:
  - Must be a finite number `>= 0`.
- `angularThresholdDeg`:
  - If provided, must be in `(0, 180]`. Defaults: `10` for conjunction/opposition, `30` for parade.
- `stepDays`:
  - If provided, must be `> 0`. Default: `1.0` day (dynamically bounded by fastest planet orbit / 8).

### 6. `EventSearchResult`
Result payload returned by the calculation engine.
```typescript
export interface EventSearchResult {
  status: EventSearchStatus
  eventType: EventType
  participatingPlanets: string[]
  time: number | null
  minAngularDifferenceDeg: number
  targetDate?: string
  title?: string
  errorCode?: ValidationErrorCode
  errorMessage?: string
}
```

#### Fields Description
- `status`: `'FOUND'` if minimum angle is within `angularThresholdDeg`, `'NOT_FOUND'` if checked without reaching threshold, `'ERROR'` on parameter validation failure.
- `time`: Floating-point days from `startTime` when the minimum occurs, or `null` if not found / error.
- `minAngularDifferenceDeg`: Smallest angle achieved in degrees, normalized to `[0, 180]`.
- `targetDate`: Formatted ISO 8601 date string corresponding to `startTime + time`.
- `title`: Localized human-readable title (e.g. "Соединение: Земля и Марс").
- `errorCode`: Defined when `status === 'ERROR'`.
- `errorMessage`: Localized error message corresponding to `errorCode`.

---

## State Transition Diagram (UI)

```text
       +------------------+
       |       Idle       | <-------------+
       +------------------+               |
                 | (Click "Find")         |
                 v                        |
       +------------------+               |
       |   Calculating    |               |
       +------------------+               |
         /       |        \               |
(FOUND) /  (NOT_FOUND)     \ (ERROR)      |
       v         v          v             |
  +---------+ +-------+ +-------+         |
  | Success | | Empty | | Error |         |
  +---------+ +-------+ +-------+         |
       |          |         |             |
 (Jump/Reset)  (Retry)   (Retry)          |
       +----------+---------+-------------+
```
