import { ASTRONOMICAL_CATALOG, BodyAstronomicalProfile } from '../data/catalog.js'

export interface ScaledSystemBody {
  id: string
  name: string
  russianName: string
  type: string
  radius: number
  distance: number
  orbitalPeriod: number
  rotationSpeed: number
  color: number
  realRadiusKm: number
  realDistanceMillionKm: number
  massFormatted: string
  ring?: {
    innerRadius: number
    outerRadius: number
    color: number
  }
}

/**
 * Решает уравнение Кеплера: M = E - e * sin(E) методом Ньютона-Рафсона
 * @param M Средняя аномалия (в радианах)
 * @param e Эксцентриситет
 */
export function solveKepler(M: number, e: number, tolerance = 1e-6): number {
  let E = M
  for (let i = 0; i < 25; i++) {
    const delta = E - e * Math.sin(E) - M
    if (Math.abs(delta) < tolerance) break
    E = E - delta / (1 - e * Math.cos(E))
  }
  return E
}

/**
 * Вычисляет положение небесного тела по кеплеровой орбите
 * @param semiMajorAxis Большая полуось
 * @param eccentricity Эксцентриситет
 * @param trueAnomaly Истинная аномалия или угол в радианах
 */
export function calculateOrbitPosition(
  semiMajorAxis: number,
  eccentricity: number,
  trueAnomaly: number,
  inclinationRad: number = 0
) {
  // r = a * (1 - e^2) / (1 + e * cos(nu))
  const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly))
  const x = r * Math.cos(trueAnomaly)
  const z = r * Math.sin(trueAnomaly) * Math.cos(inclinationRad)
  const y = r * Math.sin(trueAnomaly) * Math.sin(inclinationRad)

  return { x, y, z, distance: r }
}

/**
 * Генерирует параметры масштабирования для Three.js сцены
 * Поддерживает 'stylized' (визуальный читаемый масштаб) и 'realistic' (пропорциональный физический)
 */
export function scaleSolarSystem(mode: 'stylized' | 'realistic'): ScaledSystemBody[] {
  const bodies = Object.values(ASTRONOMICAL_CATALOG).filter(b => b.id !== 'pluto') // 8 планет + Солнце

  if (mode === 'stylized') {
    // Стилизованный масштаб, оптимизированный под интерактивный 3D-вьюпорт
    const stylizedDistances: Record<string, number> = {
      sun: 0,
      mercury: 12,
      venus: 18,
      earth: 26,
      mars: 34,
      jupiter: 46,
      saturn: 60,
      uranus: 74,
      neptune: 86
    }

    const stylizedRadii: Record<string, number> = {
      sun: 6.5,
      mercury: 0.8,
      venus: 1.4,
      earth: 1.5,
      mars: 1.1,
      jupiter: 3.5,
      saturn: 2.8,
      uranus: 2.0,
      neptune: 1.9
    }

    return bodies.map(b => {
      const hexNum = parseInt(b.colorHex.replace('#', ''), 16)
      const res: ScaledSystemBody = {
        id: b.id,
        name: b.name,
        russianName: b.russianName,
        type: b.type,
        radius: stylizedRadii[b.id] ?? 1.0,
        distance: stylizedDistances[b.id] ?? 50,
        orbitalPeriod: b.orbitalPeriodDays > 0 ? b.orbitalPeriodDays : 1,
        rotationSpeed: b.rotationPeriodHours !== 0 ? Math.min(2.0, Math.max(0.1, +(24 / Math.abs(b.rotationPeriodHours)).toFixed(2))) : 0.1,
        color: hexNum,
        realRadiusKm: b.radiusKm,
        realDistanceMillionKm: +(b.semiMajorAxisKm / 1e6).toFixed(1),
        massFormatted: b.massFormatted
      }

      if (b.rings) {
        res.ring = {
          innerRadius: +(res.radius * 1.3).toFixed(2),
          outerRadius: +(res.radius * 2.2).toFixed(2),
          color: 0xd4af37
        }
      }

      return res
    })
  }

  // Realistic: масштаб где Земля = радиус 0.5, 1 AU = 100 единиц сцены
  const EARTH_RADIUS = 6371.0
  const BASE_EARTH_SIZE = 0.5
  const AU_UNITS = 100 // 1 AU = 100 units

  return bodies.map(b => {
    const hexNum = parseInt(b.colorHex.replace('#', ''), 16)
    // Логарифмически сглаженный радиус для видимости или чистый относительный
    const scaledRadius = +(BASE_EARTH_SIZE * (b.radiusKm / EARTH_RADIUS)).toFixed(3)
    const scaledDist = +(b.semiMajorAxisAU * AU_UNITS).toFixed(2)

    const res: ScaledSystemBody = {
      id: b.id,
      name: b.name,
      russianName: b.russianName,
      type: b.type,
      radius: b.id === 'sun' ? 8.0 : Math.max(0.2, scaledRadius), // Солнце сжимаем чтобы не заслоняло
      distance: scaledDist,
      orbitalPeriod: b.orbitalPeriodDays > 0 ? b.orbitalPeriodDays : 1,
      rotationSpeed: b.rotationPeriodHours !== 0 ? +(24 / Math.abs(b.rotationPeriodHours)).toFixed(2) : 0.1,
      color: hexNum,
      realRadiusKm: b.radiusKm,
      realDistanceMillionKm: +(b.semiMajorAxisKm / 1e6).toFixed(1),
      massFormatted: b.massFormatted
    }

    if (b.rings) {
      res.ring = {
        innerRadius: +(res.radius * 1.3).toFixed(2),
        outerRadius: +(res.radius * 2.2).toFixed(2),
        color: 0xd4af37
      }
    }

    return res
  })
}
