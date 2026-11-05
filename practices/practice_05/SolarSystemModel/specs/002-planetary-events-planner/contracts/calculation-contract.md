# Core Calculation Contract: astronomicalEvents.ts

## Module Path
`src/core/astronomicalEvents.ts`

## Exported Types & Interfaces

```typescript
export type EventType = 'parade' | 'opposition' | 'conjunction'

export type ValidationErrorCode =
  | 'INVALID_PLANET_COUNT'
  | 'RANGE_EXCEEDED'
  | 'INVALID_PLANET_ID'
  | 'INVALID_TIME_RANGE'

export type EventSearchStatus = 'FOUND' | 'NOT_FOUND' | 'ERROR'

export interface EventSearchParams {
  eventType: EventType
  planetIds: string[]
  startTime: number
  timeRangeDays: number
  angularThresholdDeg?: number
  stepDays?: number
}

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

## Function Signatures

### 1. `validateEventParams(params: EventSearchParams, knownPlanetIds?: string[]): ValidationErrorCode | null`
Validates search parameters before calculations. Returns `null` if valid, or a `ValidationErrorCode`.

### 2. `findAstronomicalEvent(params: EventSearchParams, baseDate?: Date): EventSearchResult`
Calculates and locates the local minimum of planetary angular difference over the requested forecast time window.
- **Deterministic**: Always returns the same result for identical inputs.
- **Zero DOM/Vue dependencies**: Pure computational function.
- **Guarantees**:
  - `minAngularDifferenceDeg` is always in `[0, 180]`.
  - Execution completes within 50ms for `timeRangeDays <= 365`.
  - Never throws unhandled exceptions; errors return `{ status: 'ERROR', errorCode, ... }`.
