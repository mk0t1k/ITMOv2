# UI Component Contract: AstronomicalEventsPanel.vue

## Component Path
`src/components/AstronomicalEventsPanel.vue`

## Props

```typescript
interface Props {
  /** Current simulation time in days from simulation start */
  currentSimulationTime: number
  /** Available celestial bodies for selection */
  availablePlanets: CelestialBodyData[]
}
```

## Emits

```typescript
interface Emits {
  /** Triggered when the user initiates an event search */
  (e: 'search', params: EventSearchParams): void
  /** Triggered when the user confirms jumping to the calculated event date */
  (e: 'time-jump', targetTime: number | string): void
  /** Triggered when the panel is closed or collapsed */
  (e: 'close'): void
}
```

## State Representation (`PlannerUIState`)

| State | Triggers | Visible Elements | Interaction Constraints |
|---|---|---|---|
| `Idle` | Initial mount, form reset | Event selector, planet checkboxes/select, time range input, "Find Event" button | All inputs enabled. Result container hidden. |
| `Calculating` | "Find Event" button clicked | Loading spinner / pulsing radar animation, status text | All inputs and buttons disabled. |
| `Success` | Calculation returned `FOUND` | Event title, target date string, minimum angular separation badge, "Fast-forward to Date" button | Fast-forward button enabled. |
| `Empty` | Calculation returned `NOT_FOUND` | Empty state illustration/icon, warning message ("Событие не найдено в заданном диапазоне"), "Expand Range" hint | Search button re-enabled. |
| `Error` | Calculation returned `ERROR` or validation failed | Localized error banner, "Retry" button | Inputs editable, retry action available. |

## Error Localization Table

| `ValidationErrorCode` | Russian Localized Text |
|---|---|
| `INVALID_PLANET_COUNT` | «Необходимо выбрать минимум 2 планеты (или 3 для парада планет).» |
| `RANGE_EXCEEDED` | «Диапазон поиска не может превышать 36 500 дней (100 лет).» |
| `INVALID_TIME_RANGE` | «Укажите положительное количество дней для поиска.» |
| `INVALID_PLANET_ID` | «Указана неизвестная планета.» |
