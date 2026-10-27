/**
 * Astronomical Events Module
 * Pure TypeScript core engine with ZERO dependencies on Vue, Three.js, or DOM.
 */

export type EventType = 'parade' | 'opposition' | 'conjunction'

export type ValidationErrorCode =
  | 'INVALID_PLANET_COUNT'
  | 'RANGE_EXCEEDED'
  | 'INVALID_PLANET_ID'
  | 'INVALID_TIME_RANGE'

export type EventSearchStatus = 'FOUND' | 'NOT_FOUND' | 'ERROR'

export type PlannerUIState = 'Idle' | 'Calculating' | 'Success' | 'Empty' | 'Error'

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

export const ERROR_MESSAGES_RU: Record<ValidationErrorCode, string> = {
  INVALID_PLANET_COUNT: 'Необходимо выбрать минимум 2 планеты (или 3 для парада планет).',
  RANGE_EXCEEDED: 'Диапазон поиска не может превышать 36 500 дней (100 лет).',
  INVALID_TIME_RANGE: 'Укажите положительное количество дней для поиска.',
  INVALID_PLANET_ID: 'Указана неизвестная планета.'
}

/**
 * Standard planetary orbital configuration for calculations.
 * In a pure module, periods and initial angles match the simulation models.
 */
interface PlanetOrbitInfo {
  id: string
  name: string
  russianName: string
  orbitalPeriod: number
  initialAngle: number
  angularSpeed: number
}

const PLANET_DEFINITIONS: Array<{ id: string; name: string; russianName: string; orbitalPeriod: number }> = [
  { id: 'mercury', name: 'Mercury', russianName: 'Меркурий', orbitalPeriod: 88 },
  { id: 'venus', name: 'Venus', russianName: 'Венера', orbitalPeriod: 224.7 },
  { id: 'earth', name: 'Earth', russianName: 'Земля', orbitalPeriod: 365.25 },
  { id: 'mars', name: 'Mars', russianName: 'Марс', orbitalPeriod: 687 },
  { id: 'jupiter', name: 'Jupiter', russianName: 'Юпитер', orbitalPeriod: 4333 },
  { id: 'saturn', name: 'Saturn', russianName: 'Сатурн', orbitalPeriod: 10759 },
  { id: 'uranus', name: 'Uranus', russianName: 'Уран', orbitalPeriod: 30687 },
  { id: 'neptune', name: 'Neptune', russianName: 'Нептун', orbitalPeriod: 60190 }
]

const TOTAL_PLANETS = PLANET_DEFINITIONS.length
const BASE_SPEED = 2.0

const PLANET_ORBIT_REGISTRY: Record<string, PlanetOrbitInfo> = {}
PLANET_DEFINITIONS.forEach((def, index) => {
  const scaledPeriod = Math.pow(def.orbitalPeriod, 0.45)
  const angularSpeed = BASE_SPEED / scaledPeriod
  const initialAngle = (index * (Math.PI * 2)) / TOTAL_PLANETS
  PLANET_ORBIT_REGISTRY[def.id] = {
    ...def,
    initialAngle,
    angularSpeed
  }
})

/**
 * Validates search parameters before calculations.
 * Returns null if valid, or a ValidationErrorCode.
 */
export function validateEventParams(
  params: EventSearchParams,
  knownPlanetIds?: string[]
): ValidationErrorCode | null {
  if (!params) {
    return 'INVALID_TIME_RANGE'
  }

  // 1. timeRangeDays checks
  if (
    typeof params.timeRangeDays !== 'number' ||
    !Number.isFinite(params.timeRangeDays) ||
    params.timeRangeDays <= 0
  ) {
    return 'INVALID_TIME_RANGE'
  }

  if (params.timeRangeDays > 36500) {
    return 'RANGE_EXCEEDED'
  }

  // 2. planetIds checks
  if (!Array.isArray(params.planetIds)) {
    return 'INVALID_PLANET_COUNT'
  }

  const uniquePlanetIds = Array.from(new Set(params.planetIds))
  if (uniquePlanetIds.length !== params.planetIds.length) {
    return 'INVALID_PLANET_COUNT'
  }

  if (params.eventType === 'parade') {
    if (uniquePlanetIds.length < 3) {
      return 'INVALID_PLANET_COUNT'
    }
  } else if (params.eventType === 'conjunction' || params.eventType === 'opposition') {
    if (uniquePlanetIds.length < 2) {
      return 'INVALID_PLANET_COUNT'
    }
  } else {
    return 'INVALID_PLANET_COUNT'
  }

  const allowedIds = knownPlanetIds && knownPlanetIds.length > 0
    ? new Set(knownPlanetIds)
    : new Set(Object.keys(PLANET_ORBIT_REGISTRY))

  for (const id of uniquePlanetIds) {
    if (!allowedIds.has(id)) {
      return 'INVALID_PLANET_ID'
    }
  }

  return null
}

/**
 * Normalizes an angle in radians to [0, 2π)
 */
export function normalizeAngleRad(angle: number): number {
  const twoPi = 2 * Math.PI
  return ((angle % twoPi) + twoPi) % twoPi
}

/**
 * Calculates absolute circular angular difference between two angles (in radians),
 * normalized strictly to [0, π] radians ([0, 180] degrees).
 */
export function angularDistanceRad(angle1: number, angle2: number): number {
  const diff = Math.abs(normalizeAngleRad(angle1) - normalizeAngleRad(angle2))
  return diff > Math.PI ? 2 * Math.PI - diff : diff
}

/**
 * Converts radians to degrees normalized strictly to [0, 180]
 */
export function radToDegNormalized(rad: number): number {
  const deg = (rad * 180) / Math.PI
  return Math.min(180, Math.max(0, deg))
}

/**
 * Calculates the minimal circular arc (in radians) containing all angles in an array.
 * Output is in [0, 2π]. For a parade of planets, this represents the angular sector.
 */
export function minimalArcSpanRad(angles: number[]): number {
  if (angles.length <= 1) return 0
  const normalized = angles.map(normalizeAngleRad).sort((a, b) => a - b)
  const twoPi = 2 * Math.PI
  let maxGap = 0

  for (let i = 0; i < normalized.length; i++) {
    const next = i === normalized.length - 1 ? normalized[0] + twoPi : normalized[i + 1]
    const gap = next - normalized[i]
    if (gap > maxGap) {
      maxGap = gap
    }
  }

  return Math.max(0, twoPi - maxGap)
}

/**
 * Evaluates planet angle at time t (days from start)
 */
function getPlanetAngleAtTime(planet: PlanetOrbitInfo, tDays: number): number {
  return normalizeAngleRad(planet.initialAngle + planet.angularSpeed * tDays)
}

/**
 * Calculates objective function value (in radians) for given event type and planets at time t
 */
function evaluateObjective(
  eventType: EventType,
  planets: PlanetOrbitInfo[],
  tDays: number
): number {
  const angles = planets.map(p => getPlanetAngleAtTime(p, tDays))

  if (eventType === 'conjunction') {
    // For 2 planets: angular distance -> 0
    // If more than 2, maximum pair angular distance or span
    return angles.length === 2
      ? angularDistanceRad(angles[0], angles[1])
      : minimalArcSpanRad(angles)
  }

  if (eventType === 'opposition') {
    // For 2 planets: angular distance ~ PI. Deviation is |PI - angularDistance|
    const dist = angularDistanceRad(angles[0], angles[1])
    return Math.abs(Math.PI - dist)
  }

  if (eventType === 'parade') {
    // Sector span containing all planets
    return minimalArcSpanRad(angles)
  }

  return 0
}

/**
 * Golden-section search minimization on interval [a, b]
 */
function minimizeGoldenSection(
  f: (t: number) => number,
  a: number,
  b: number,
  tol: number = 0.01,
  maxIter: number = 40
): { tMin: number; valMin: number } {
  const phi = (Math.sqrt(5) - 1) / 2
  let x1 = b - phi * (b - a)
  let x2 = a + phi * (b - a)
  let f1 = f(x1)
  let f2 = f(x2)

  let iter = 0
  while (Math.abs(b - a) > tol && iter < maxIter) {
    if (f1 < f2) {
      b = x2
      x2 = x1
      f2 = f1
      x1 = b - phi * (b - a)
      f1 = f(x1)
    } else {
      a = x1
      x1 = x2
      f1 = f2
      x2 = a + phi * (b - a)
      f2 = f(x2)
    }
    iter++
  }

  const tMin = (a + b) / 2
  return { tMin, valMin: f(tMin) }
}

function generateEventTitle(eventType: EventType, planets: PlanetOrbitInfo[]): string {
  const names = planets.map(p => p.russianName).join(' и ')
  switch (eventType) {
    case 'conjunction':
      return `Соединение: ${names}`
    case 'opposition':
      return `Противостояние: ${names}`
    case 'parade':
      return `Парад планет: ${names}`
  }
}

/**
 * Calculates and locates the local minimum of planetary angular difference
 * over the requested forecast time window.
 */
export function findAstronomicalEvent(
  params: EventSearchParams,
  baseDate: Date = new Date(1761609600000) // Default base epoch: 2025-10-28T00:00:00Z
): EventSearchResult {
  const validationError = validateEventParams(params)
  if (validationError) {
    return {
      status: 'ERROR',
      eventType: params?.eventType || 'conjunction',
      participatingPlanets: params?.planetIds || [],
      time: null,
      minAngularDifferenceDeg: 180,
      errorCode: validationError,
      errorMessage: ERROR_MESSAGES_RU[validationError]
    }
  }

  const planets = params.planetIds.map(id => PLANET_ORBIT_REGISTRY[id]).filter(Boolean)
  const defaultThreshold = params.eventType === 'parade' ? 30 : 10
  const thresholdDeg = params.angularThresholdDeg ?? defaultThreshold
  const thresholdRad = (thresholdDeg * Math.PI) / 180

  const startTime = params.startTime || 0
  const timeRange = params.timeRangeDays

  // Adaptive coarse step based on fastest planet's period
  const minPeriod = Math.min(...planets.map(p => p.orbitalPeriod))
  const maxSafeStep = Math.max(0.1, minPeriod / 16)
  const coarseStep = params.stepDays ? Math.min(params.stepDays, maxSafeStep) : Math.min(1.0, maxSafeStep)

  const stepsCount = Math.ceil(timeRange / coarseStep)
  let bestT = startTime
  let bestValRad = evaluateObjective(params.eventType, planets, startTime)

  // Scan for global minimum in the range or first significant local minimum under threshold
  for (let i = 1; i <= stepsCount; i++) {
    const t = Math.min(startTime + timeRange, startTime + i * coarseStep)
    const valRad = evaluateObjective(params.eventType, planets, t)

    if (valRad < bestValRad) {
      bestValRad = valRad
      bestT = t
    }

    // Early exit if alignment is virtually exact
    if (valRad < 0.0001) {
      break
    }
  }

  // Refine using golden section around bestT
  const bracketRadius = coarseStep * 1.5
  const a = Math.max(startTime, bestT - bracketRadius)
  const b = Math.min(startTime + timeRange, bestT + bracketRadius)

  const refined = minimizeGoldenSection(
    t => evaluateObjective(params.eventType, planets, t),
    a,
    b,
    0.005,
    30
  )

  const finalT = Math.round(refined.tMin * 100) / 100
  const finalValDeg = radToDegNormalized(refined.valMin)
  const roundedDeg = Math.round(finalValDeg * 100) / 100

  const isFound = refined.valMin <= thresholdRad

  const targetDateMs = baseDate.getTime() + finalT * 86400000
  const targetDateStr = new Date(targetDateMs).toISOString()

  return {
    status: isFound ? 'FOUND' : 'NOT_FOUND',
    eventType: params.eventType,
    participatingPlanets: params.planetIds,
    time: isFound ? finalT : null,
    minAngularDifferenceDeg: roundedDeg,
    targetDate: isFound ? targetDateStr : undefined,
    title: generateEventTitle(params.eventType, planets)
  }
}
