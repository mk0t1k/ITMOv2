import { describe, it, expect } from 'vitest'
import { filterCelestialBodies } from '../src/utils/celestialFilter'
import { PLANETS_DATA, SUN_DATA, type CelestialBodyData } from '../src/data/celestialBodies'

describe('filterCelestialBodies', () => {
  const allBodies: CelestialBodyData[] = [SUN_DATA, ...PLANETS_DATA]

  it('возвращает полный список, если запрос пустой или содержит только пробелы', () => {
    expect(filterCelestialBodies(allBodies, '')).toHaveLength(allBodies.length)
    expect(filterCelestialBodies(allBodies, '   ')).toHaveLength(allBodies.length)
  })

  it('корректно фильтрует по точному совпадению на русском языке', () => {
    const result = filterCelestialBodies(allBodies, 'Марс')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('mars')
  })

  it('фильтрует без учёта регистра (русский язык: малый, заглавный, смешанный)', () => {
    const lower = filterCelestialBodies(allBodies, 'марс')
    const upper = filterCelestialBodies(allBodies, 'МАРС')
    const mixed = filterCelestialBodies(allBodies, 'мАрС')

    expect(lower).toHaveLength(1)
    expect(upper).toHaveLength(1)
    expect(mixed).toHaveLength(1)
    expect(lower[0].id).toBe('mars')
    expect(upper[0].id).toBe('mars')
    expect(mixed[0].id).toBe('mars')
  })

  it('корректно фильтрует по частичному совпадению (подстрока) на русском языке', () => {
    // "ур" должно найти Сатурн и Уран
    const result = filterCelestialBodies(allBodies, 'ур')
    const ids = result.map(b => b.id)
    expect(ids).toContain('saturn')
    expect(ids).toContain('uranus')
  })

  it('фильтрует по точному и частичному совпадению на английском языке без учёта регистра', () => {
    const jup = filterCelestialBodies(allBodies, 'jup')
    expect(jup).toHaveLength(1)
    expect(jup[0].id).toBe('jupiter')

    const earthUpper = filterCelestialBodies(allBodies, 'EARTH')
    expect(earthUpper).toHaveLength(1)
    expect(earthUpper[0].id).toBe('earth')
  })

  it('находит Солнце как по "Солнце", так и по "Sun"', () => {
    const ru = filterCelestialBodies(allBodies, 'Солнце')
    const en = filterCelestialBodies(allBodies, 'sun')
    expect(ru).toHaveLength(1)
    expect(ru[0].id).toBe('sun')
    expect(en).toHaveLength(1)
    expect(en[0].id).toBe('sun')
  })

  it('возвращает пустой массив, если ни одно небесное тело не совпадает', () => {
    const result = filterCelestialBodies(allBodies, 'Плутон-999')
    expect(result).toHaveLength(0)
  })

  it('не мутирует исходный массив', () => {
    const originalCopy = [...allBodies]
    filterCelestialBodies(allBodies, 'mars')
    expect(allBodies).toEqual(originalCopy)
  })

  it('позволяет выбрать первое совпадение для автофокуса по Enter', () => {
    const query = 'ма'
    const results = filterCelestialBodies(allBodies, query)
    expect(results.length).toBeGreaterThan(0)
    // Первое совпадение должно быть Марсом ("Марс")
    expect(results[0].id).toBe('mars')
  })

  it('не возвращает кандидатов при отсутствии совпадений (Enter не должен срабатывать)', () => {
    const results = filterCelestialBodies(allBodies, 'non-existent-star')
    expect(results.length).toBe(0)
    expect(results[0]).toBeUndefined()
  })
})
