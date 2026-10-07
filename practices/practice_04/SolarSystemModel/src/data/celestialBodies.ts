export interface CelestialBodyData {
  id: string
  name: string
  russianName: string
  type: 'star' | 'terrestrial' | 'gas_giant' | 'ice_giant'
  typeName: string // Название типа на русском
  radius: number // Визуальный радиус планеты в стилизованном масштабе
  realRadiusKm: number // Реальный радиус в км
  distance: number // Дистанция от центра Солнца (орбитальный радиус в сцене)
  realDistanceMillionKm: number // Дистанция от Солнца в миллионах км
  massKg: string // Масса планеты
  orbitalPeriod: number // Относительный орбитальный период (земных дней)
  rotationSpeed: number // Скорость осевого вращения (рад/с)
  color: number // Основной hex цвет
  emissive?: number
  emissiveIntensity?: number
  interestingFacts: string[] // 1-2 интересных научных факта
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
  type: 'star',
  typeName: 'Жёлтый карлик (Звезда)',
  radius: 6.5,
  realRadiusKm: 696340,
  distance: 0,
  realDistanceMillionKm: 0,
  massKg: '1.989 × 10³⁰ кг (99.86% массы Солнечной системы)',
  orbitalPeriod: 1,
  rotationSpeed: 0.1,
  color: 0xffaa00,
  emissive: 0xff7700,
  emissiveIntensity: 1.2,
  interestingFacts: [
    'Солнце вырабатывает энергию за счёт термоядерного синтеза водорода в гелий в своём ядре.',
    'Свет от поверхности Солнца доходит до Земли примерно за 8 минут и 20 секунд.'
  ]
}

export const PLANETS_DATA: CelestialBodyData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    russianName: 'Меркурий',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    radius: 0.8,
    realRadiusKm: 2439.7,
    distance: 12,
    realDistanceMillionKm: 57.9,
    massKg: '3.301 × 10²³ кг',
    orbitalPeriod: 88,
    rotationSpeed: 0.4,
    color: 0x9e9e9e,
    interestingFacts: [
      'Самая близкая к Солнцу и самая маленькая планета Солнечной системы.',
      'Из-за отсутствия плотной атмосферы перепад температур достигает от -180 °C ночью до +430 °C днём.'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    russianName: 'Венера',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    radius: 1.4,
    realRadiusKm: 6051.8,
    distance: 18,
    realDistanceMillionKm: 108.2,
    massKg: '4.867 × 10²⁴ кг',
    orbitalPeriod: 224.7,
    rotationSpeed: 0.25,
    color: 0xe0bb70,
    interestingFacts: [
      'Самая горячая планета системы из-за мощного парникового эффекта плотной углекислотной атмосферы.',
      'Вращается вокруг своей оси в обратную сторону по сравнению с большинством других планет.'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    russianName: 'Земля',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    radius: 1.5,
    realRadiusKm: 6371.0,
    distance: 26,
    realDistanceMillionKm: 149.6,
    massKg: '5.972 × 10²⁴ кг',
    orbitalPeriod: 365.25,
    rotationSpeed: 0.8,
    color: 0x2e86de,
    interestingFacts: [
      'Единственное известное космическое тело, населённое живыми организмами.',
      'Порядка 71% поверхности покрыто жидкой водой, необходимой для жизни.'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    russianName: 'Марс',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    radius: 1.1,
    realRadiusKm: 3389.5,
    distance: 34,
    realDistanceMillionKm: 227.9,
    massKg: '6.417 × 10²³ кг',
    orbitalPeriod: 687,
    rotationSpeed: 0.7,
    color: 0xeb4d4b,
    interestingFacts: [
      'На Марсе расположен вулкан Олимп — высочайшая известная гора в Солнечной системе (высота около 22 км).',
      'Характерный красный цвет поверхности обусловлен высоким содержанием оксида железа (ржавчины).'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    russianName: 'Юпитер',
    type: 'gas_giant',
    typeName: 'Газовый гигант',
    radius: 3.5,
    realRadiusKm: 69911,
    distance: 46,
    realDistanceMillionKm: 778.6,
    massKg: '1.898 × 10²⁷ кг',
    orbitalPeriod: 4333,
    rotationSpeed: 1.2,
    color: 0xdfa369,
    interestingFacts: [
      'Крупнейшая планета системы, чья масса более чем в 2.5 раза превышает массу всех остальных планет вместе взятых.',
      'Знаменитое Большое Красное Пятно — гигантский шторм-антициклон, бушующий сотни лет.'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    russianName: 'Сатурн',
    type: 'gas_giant',
    typeName: 'Газовый гигант',
    radius: 2.8,
    realRadiusKm: 58232,
    distance: 60,
    realDistanceMillionKm: 1433.5,
    massKg: '5.683 × 10²⁶ кг',
    orbitalPeriod: 10759,
    rotationSpeed: 1.0,
    color: 0xf1c40f,
    interestingFacts: [
      'Обладает наиболее развитой и зрелищной системой колец из ледяных частиц и силикатной пыли.',
      'Средняя плотность Сатурна меньше плотности воды: он мог бы плавать на поверхности огромного океана.'
    ],
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
    type: 'ice_giant',
    typeName: 'Ледяной гигант',
    radius: 2.0,
    realRadiusKm: 25362,
    distance: 74,
    realDistanceMillionKm: 2872.5,
    massKg: '8.681 × 10²⁵ кг',
    orbitalPeriod: 30687,
    rotationSpeed: 0.6,
    color: 0x74b9ff,
    interestingFacts: [
      'Вращается практически «лёжа на боку»: наклон оси вращения к плоскости орбиты составляет около 97.8°.',
      'Имеет самую холодную планетарную атмосферу в Солнечной системе с температурами до -224 °C.'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    russianName: 'Нептун',
    type: 'ice_giant',
    typeName: 'Ледяной гигант',
    radius: 1.9,
    realRadiusKm: 24622,
    distance: 86,
    realDistanceMillionKm: 4495.1,
    massKg: '1.024 × 10²⁶ кг',
    orbitalPeriod: 60190,
    rotationSpeed: 0.55,
    color: 0x0984e3,
    interestingFacts: [
      'На Нептуне зафиксированы самые сильные ветры среди всех планет — их скорость достигает 2100 км/ч.',
      'Был открыт в 1846 году благодаря математическим расчётам гравитационных возмущений орбиты Урана.'
    ]
  }
]
