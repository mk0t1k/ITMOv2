export interface CelestialBodyData {
  id: string
  name: string
  russianName: string
  radius: number // Визуальный радиус планеты
  distance: number // Дистанция от центра Солнца (орбитальный радиус)
  orbitalPeriod: number // Относительный орбитальный период (земных дней / условных единиц)
  rotationSpeed: number // Скорость осевого вращения (рад/с)
  color: number // Основной hex цвет
  emissive?: number
  emissiveIntensity?: number
  ring?: {
    innerRadius: number
    outerRadius: number
    color: number
  }
}

export const SUN_DATA: CelestialBodyData = {
  id: 'sun',
  name: 'Sun',
  russianName: 'Солнце',
  radius: 6.5,
  distance: 0,
  orbitalPeriod: 1,
  rotationSpeed: 0.1,
  color: 0xffaa00,
  emissive: 0xff7700,
  emissiveIntensity: 1.2
}

export const PLANETS_DATA: CelestialBodyData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    russianName: 'Меркурий',
    radius: 0.8,
    distance: 12,
    orbitalPeriod: 88,
    rotationSpeed: 0.4,
    color: 0x9e9e9e
  },
  {
    id: 'venus',
    name: 'Venus',
    russianName: 'Венера',
    radius: 1.4,
    distance: 18,
    orbitalPeriod: 224.7,
    rotationSpeed: 0.25,
    color: 0xe0bb70
  },
  {
    id: 'earth',
    name: 'Earth',
    russianName: 'Земля',
    radius: 1.5,
    distance: 26,
    orbitalPeriod: 365.25,
    rotationSpeed: 0.8,
    color: 0x2e86de
  },
  {
    id: 'mars',
    name: 'Mars',
    russianName: 'Марс',
    radius: 1.1,
    distance: 34,
    orbitalPeriod: 687,
    rotationSpeed: 0.7,
    color: 0xeb4d4b
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    russianName: 'Юпитер',
    radius: 3.5,
    distance: 46,
    orbitalPeriod: 4333,
    rotationSpeed: 1.2,
    color: 0xdfa369
  },
  {
    id: 'saturn',
    name: 'Saturn',
    russianName: 'Сатурн',
    radius: 2.8,
    distance: 60,
    orbitalPeriod: 10759,
    rotationSpeed: 1.0,
    color: 0xf1c40f,
    ring: {
      innerRadius: 3.6,
      outerRadius: 6.2,
      color: 0xd4af37
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    russianName: 'Уран',
    radius: 2.0,
    distance: 74,
    orbitalPeriod: 30687,
    rotationSpeed: 0.6,
    color: 0x74b9ff
  },
  {
    id: 'neptune',
    name: 'Neptune',
    russianName: 'Нептун',
    radius: 1.9,
    distance: 86,
    orbitalPeriod: 60190,
    rotationSpeed: 0.55,
    color: 0x0984e3
  }
]
