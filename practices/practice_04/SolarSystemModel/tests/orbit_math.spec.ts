import { describe, it, expect } from 'vitest'
import { OrbitCalculator } from '../src/core/OrbitCalculator'
import { PLANETS_DATA } from '../src/data/celestialBodies'

describe('OrbitCalculator', () => {
  const calculator = new OrbitCalculator()

  it('должен вычислять корректные координаты XZ для углов 0, PI/2, PI', () => {
    const dist = 10
    const pos0 = calculator.calculatePosition(dist, 0)
    expect(pos0.x).toBeCloseTo(10)
    expect(pos0.y).toBe(0)
    expect(pos0.z).toBeCloseTo(0)

    const posHalfPi = calculator.calculatePosition(dist, Math.PI / 2)
    expect(posHalfPi.x).toBeCloseTo(0)
    expect(posHalfPi.y).toBe(0)
    expect(posHalfPi.z).toBeCloseTo(10)

    const posPi = calculator.calculatePosition(dist, Math.PI)
    expect(posPi.x).toBeCloseTo(-10)
    expect(posPi.y).toBe(0)
    expect(posPi.z).toBeCloseTo(0)
  })

  it('должен сохранять строгую монотонность орбитальных скоростей (Меркурий быстрее всех, Нептун медленнее всех)', () => {
    const speeds = PLANETS_DATA.map(p => ({
      name: p.name,
      speed: calculator.getAngularSpeed(p.orbitalPeriod)
    }))

    for (let i = 0; i < speeds.length - 1; i++) {
      expect(speeds[i].speed).toBeGreaterThan(speeds[i + 1].speed)
    }
  })

  it('должен циклически увеличивать угол с учетом delta и нормализовать по модулю 2PI', () => {
    const startAngle = 0
    const speed = 1.0
    const delta = 0.5
    const nextAngle = calculator.updateAngle(startAngle, speed, delta)
    expect(nextAngle).toBeCloseTo(0.5)

    const wrappedAngle = calculator.updateAngle(Math.PI * 2 - 0.1, speed, 0.2)
    expect(wrappedAngle).toBeCloseTo(0.1)
  })
})
