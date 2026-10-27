import { describe, it, expect } from 'vitest'
import {
  findAstronomicalEvent,
  validateEventParams,
  angularDistanceRad,
  minimalArcSpanRad,
  radToDegNormalized,
  type EventSearchParams
} from '../src/core/astronomicalEvents'
import { PLANETS_DATA } from '../src/data/celestialBodies'

const KNOWN_IDS = PLANETS_DATA.map(p => p.id)

describe('Astronomical Events - User Story 1 & Foundational Math', () => {
  describe('Angular Math Helpers', () => {
    it('normalizes angles and calculates circular angular distance properly', () => {
      // 0 rad and PI rad -> PI
      expect(angularDistanceRad(0, Math.PI)).toBeCloseTo(Math.PI, 5)
      // 0.1 rad and 2*PI - 0.1 rad -> 0.2 rad
      expect(angularDistanceRad(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(0.2, 5)
      // radToDegNormalized
      expect(radToDegNormalized(0)).toBe(0)
      expect(radToDegNormalized(Math.PI)).toBe(180)
      expect(radToDegNormalized(Math.PI / 2)).toBeCloseTo(90, 5)
      expect(radToDegNormalized(2 * Math.PI)).toBe(180) // Clamped to [0, 180]
    })

    it('calculates minimal circular arc span for parade', () => {
      // 3 points clustered near 0: 0.1, 0.2, 2*PI - 0.1 -> span is 0.3 rad
      const span = minimalArcSpanRad([0.1, 0.2, 2 * Math.PI - 0.1])
      expect(span).toBeCloseTo(0.3, 5)
    })
  })

  describe('T006 [US1]: Conjunction Calculation', () => {
    it('finds conjunction between Earth and Mars within 800 days with precision < 0.1 days & < 0.1 deg', () => {
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 800,
        angularThresholdDeg: 10
      }

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('FOUND')
      expect(result.eventType).toBe('conjunction')
      expect(result.participatingPlanets).toEqual(['earth', 'mars'])
      expect(result.time).not.toBeNull()
      expect(typeof result.time).toBe('number')
      expect(result.minAngularDifferenceDeg).toBeLessThanOrEqual(10)
      expect(result.minAngularDifferenceDeg).toBeGreaterThanOrEqual(0)
      expect(result.minAngularDifferenceDeg).toBeLessThanOrEqual(180)
      expect(result.targetDate).toBeDefined()
      expect(result.title).toContain('Соединение')
    })
  })

  describe('T007 [US1]: Opposition Calculation', () => {
    it('finds opposition between Earth and Jupiter within 400 days', () => {
      const params: EventSearchParams = {
        eventType: 'opposition',
        planetIds: ['earth', 'jupiter'],
        startTime: 0,
        timeRangeDays: 400,
        angularThresholdDeg: 10
      }

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('FOUND')
      expect(result.eventType).toBe('opposition')
      expect(result.participatingPlanets).toEqual(['earth', 'jupiter'])
      expect(result.time).not.toBeNull()
      expect(result.minAngularDifferenceDeg).toBeLessThanOrEqual(10)
      expect(result.minAngularDifferenceDeg).toBeGreaterThanOrEqual(0)
      expect(result.minAngularDifferenceDeg).toBeLessThanOrEqual(180)
      expect(result.title).toContain('Противостояние')
    })
  })

  describe('T008 [US1]: Planetary Parade Calculation', () => {
    it('finds parade across 3 planets (Earth, Mars, Venus)', () => {
      const params: EventSearchParams = {
        eventType: 'parade',
        planetIds: ['venus', 'earth', 'mars'],
        startTime: 0,
        timeRangeDays: 1000,
        angularThresholdDeg: 45
      }

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('FOUND')
      expect(result.eventType).toBe('parade')
      expect(result.participatingPlanets).toEqual(['venus', 'earth', 'mars'])
      expect(result.time).not.toBeNull()
      expect(result.minAngularDifferenceDeg).toBeLessThanOrEqual(45)
      expect(result.minAngularDifferenceDeg).toBeGreaterThanOrEqual(0)
      expect(result.minAngularDifferenceDeg).toBeLessThanOrEqual(180)
      expect(result.title).toContain('Парад')
    })
  })

  describe('T009 [US1]: Benchmark < 50ms (SC-001)', () => {
    it('executes a 365-day search in less than 50ms', () => {
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 365
      }

      const start = performance.now()
      const result = findAstronomicalEvent(params)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(result.status).toBeDefined()
    })
  })

  describe('T014 [US2]: Date Conversion Validation', () => {
    it('validates targetDate is formatted as an ISO 8601 string matching base date offset', () => {
      const baseDate = new Date('2026-01-01T00:00:00.000Z')
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 800,
        angularThresholdDeg: 10
      }

      const result = findAstronomicalEvent(params, baseDate)
      expect(result.status).toBe('FOUND')
      expect(result.targetDate).toBeDefined()
      expect(typeof result.targetDate).toBe('string')

      // Verify ISO date format
      const parsedDate = new Date(result.targetDate!)
      expect(parsedDate.toISOString()).toBe(result.targetDate)

      // Verify offset corresponds to result.time in days
      const expectedTimeMs = baseDate.getTime() + (result.time ?? 0) * 86400000
      expect(Math.abs(parsedDate.getTime() - expectedTimeMs)).toBeLessThan(1000)
    })
  })

  describe('T018 & T019 [US3]: Validation and Empty Search Handling', () => {
    it('returns INVALID_PLANET_COUNT when fewer than 2 planets selected for conjunction or opposition', () => {
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth'],
        startTime: 0,
        timeRangeDays: 300
      }
      expect(validateEventParams(params, KNOWN_IDS)).toBe('INVALID_PLANET_COUNT')

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('ERROR')
      expect(result.errorCode).toBe('INVALID_PLANET_COUNT')
      expect(result.errorMessage).toBeDefined()
    })

    it('returns INVALID_PLANET_COUNT when duplicate planet IDs are provided', () => {
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'earth'],
        startTime: 0,
        timeRangeDays: 300
      }
      expect(validateEventParams(params, KNOWN_IDS)).toBe('INVALID_PLANET_COUNT')

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('ERROR')
      expect(result.errorCode).toBe('INVALID_PLANET_COUNT')
    })

    it('returns INVALID_PLANET_COUNT when fewer than 3 planets selected for parade', () => {
      const params: EventSearchParams = {
        eventType: 'parade',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 300
      }
      expect(validateEventParams(params, KNOWN_IDS)).toBe('INVALID_PLANET_COUNT')

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('ERROR')
      expect(result.errorCode).toBe('INVALID_PLANET_COUNT')
    })

    it('returns RANGE_EXCEEDED when timeRangeDays > 36500', () => {
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 40000
      }
      expect(validateEventParams(params, KNOWN_IDS)).toBe('RANGE_EXCEEDED')

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('ERROR')
      expect(result.errorCode).toBe('RANGE_EXCEEDED')
    })

    it('returns INVALID_TIME_RANGE when timeRangeDays <= 0 or not finite', () => {
      const params1: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 0
      }
      expect(validateEventParams(params1, KNOWN_IDS)).toBe('INVALID_TIME_RANGE')

      const params2: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: -50
      }
      expect(validateEventParams(params2, KNOWN_IDS)).toBe('INVALID_TIME_RANGE')
    })

    it('returns INVALID_PLANET_ID when unknown planet ID is provided', () => {
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'pluto'],
        startTime: 0,
        timeRangeDays: 300
      }
      expect(validateEventParams(params, KNOWN_IDS)).toBe('INVALID_PLANET_ID')

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('ERROR')
      expect(result.errorCode).toBe('INVALID_PLANET_ID')
    })

    it('T019 [US3]: returns NOT_FOUND when event threshold is not reached in given window', () => {
      // Extremely tight window of 1 day with a very small threshold where planets don't align
      const params: EventSearchParams = {
        eventType: 'conjunction',
        planetIds: ['earth', 'mars'],
        startTime: 0,
        timeRangeDays: 2,
        angularThresholdDeg: 0.001
      }

      const result = findAstronomicalEvent(params)
      expect(result.status).toBe('NOT_FOUND')
      expect(result.time).toBeNull()
      expect(result.targetDate).toBeUndefined()
    })
  })
})
