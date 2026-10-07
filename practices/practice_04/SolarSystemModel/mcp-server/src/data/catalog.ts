export interface BodyAstronomicalProfile {
  id: string
  name: string
  russianName: string
  type: 'star' | 'terrestrial' | 'gas_giant' | 'ice_giant' | 'dwarf'
  typeName: string
  semiMajorAxisAU: number // Большая полуось (AU)
  semiMajorAxisKm: number // Большая полуось (км)
  eccentricity: number // Эксцентриситет
  orbitalPeriodDays: number // Сидерический период обращения (дни)
  orbitalSpeedKmS: number // Средняя орбитальная скорость (км/с)
  inclinationDeg: number // Наклонение орбиты к эклиптике (градусы)
  radiusKm: number // Экваториальный радиус (км)
  massKg: number // Масса в кг
  massFormatted: string
  densityGCm3: number // Средняя плотность (г/см3)
  surfaceGravityMS2: number // Ускорение свободного падения (м/с2)
  rotationPeriodHours: number // Период осевого вращения (часы)
  axialTiltDeg: number // Наклон оси (градусы)
  colorHex: string
  interestingFacts: string[]
  rings?: {
    innerRadiusKm: number
    outerRadiusKm: number
  }
}

export const ASTRONOMICAL_CATALOG: Record<string, BodyAstronomicalProfile> = {
  sun: {
    id: 'sun',
    name: 'Sun',
    russianName: 'Солнце',
    type: 'star',
    typeName: 'Жёлтый карлик (Звезда)',
    semiMajorAxisAU: 0,
    semiMajorAxisKm: 0,
    eccentricity: 0,
    orbitalPeriodDays: 0,
    orbitalSpeedKmS: 0,
    inclinationDeg: 0,
    radiusKm: 696340,
    massKg: 1.9885e30,
    massFormatted: '1.989 × 10³⁰ кг',
    densityGCm3: 1.41,
    surfaceGravityMS2: 274.0,
    rotationPeriodHours: 609.12,
    axialTiltDeg: 7.25,
    colorHex: '#ffaa00',
    interestingFacts: [
      'Солнце вырабатывает энергию за счёт термоядерного синтеза водорода в гелий в своём ядре.',
      'Свет от поверхности Солнца доходит до Земли примерно за 8 минут и 20 секунд.'
    ]
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    russianName: 'Меркурий',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    semiMajorAxisAU: 0.387098,
    semiMajorAxisKm: 57909050,
    eccentricity: 0.20563,
    orbitalPeriodDays: 87.969,
    orbitalSpeedKmS: 47.36,
    inclinationDeg: 7.005,
    radiusKm: 2439.7,
    massKg: 3.3011e23,
    massFormatted: '3.301 × 10²³ кг',
    densityGCm3: 5.43,
    surfaceGravityMS2: 3.7,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.034,
    colorHex: '#9e9e9e',
    interestingFacts: [
      'Самая близкая к Солнцу и самая маленькая планета Солнечной системы.',
      'Из-за отсутствия плотной атмосферы перепад температур достигает от -180 °C ночью до +430 °C днём.'
    ]
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    russianName: 'Венера',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    semiMajorAxisAU: 0.723332,
    semiMajorAxisKm: 108208000,
    eccentricity: 0.00677,
    orbitalPeriodDays: 224.701,
    orbitalSpeedKmS: 35.02,
    inclinationDeg: 3.3947,
    radiusKm: 6051.8,
    massKg: 4.8675e24,
    massFormatted: '4.868 × 10²⁴ кг',
    densityGCm3: 5.24,
    surfaceGravityMS2: 8.87,
    rotationPeriodHours: -5832.5, // Ретроградное вращение
    axialTiltDeg: 177.36,
    colorHex: '#e0bb70',
    interestingFacts: [
      'Самая горячая планета системы из-за мощного парникового эффекта плотной углекислотной атмосферы.',
      'Вращается вокруг своей оси в обратную сторону по сравнению с большинством других планет.'
    ]
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    russianName: 'Земля',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    semiMajorAxisAU: 1.000000,
    semiMajorAxisKm: 149597870,
    eccentricity: 0.01671,
    orbitalPeriodDays: 365.256,
    orbitalSpeedKmS: 29.78,
    inclinationDeg: 0.00005,
    radiusKm: 6371.0,
    massKg: 5.9722e24,
    massFormatted: '5.972 × 10²⁴ кг',
    densityGCm3: 5.51,
    surfaceGravityMS2: 9.807,
    rotationPeriodHours: 23.934,
    axialTiltDeg: 23.44,
    colorHex: '#2e86de',
    interestingFacts: [
      'Единственное известное космическое тело, населённое живыми организмами.',
      'Порядка 71% поверхности покрыто жидкой водой, необходимой для жизни.'
    ]
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    russianName: 'Марс',
    type: 'terrestrial',
    typeName: 'Планета земной группы',
    semiMajorAxisAU: 1.523662,
    semiMajorAxisKm: 227939200,
    eccentricity: 0.0934,
    orbitalPeriodDays: 686.98,
    orbitalSpeedKmS: 24.07,
    inclinationDeg: 1.85,
    radiusKm: 3389.5,
    massKg: 6.4171e23,
    massFormatted: '6.417 × 10²³ кг',
    densityGCm3: 3.93,
    surfaceGravityMS2: 3.72,
    rotationPeriodHours: 24.623,
    axialTiltDeg: 25.19,
    colorHex: '#eb4d4b',
    interestingFacts: [
      'На Марсе расположен вулкан Олимп — высочайшая известная гора в Солнечной системе (высота около 22 км).',
      'Характерный красный цвет поверхности обусловлен высоким содержанием оксида железа (ржавчины).'
    ]
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    russianName: 'Юпитер',
    type: 'gas_giant',
    typeName: 'Газовый гигант',
    semiMajorAxisAU: 5.203363,
    semiMajorAxisKm: 778570000,
    eccentricity: 0.04849,
    orbitalPeriodDays: 4332.59,
    orbitalSpeedKmS: 13.07,
    inclinationDeg: 1.305,
    radiusKm: 69911,
    massKg: 1.8982e27,
    massFormatted: '1.898 × 10²⁷ кг',
    densityGCm3: 1.33,
    surfaceGravityMS2: 24.79,
    rotationPeriodHours: 9.925,
    axialTiltDeg: 3.13,
    colorHex: '#dfa369',
    interestingFacts: [
      'Крупнейшая планета системы, чья масса более чем в 2.5 раза превышает массу всех остальных планет вместе взятых.',
      'Знаменитое Большое Красное Пятно — гигантский шторм-антициклон, бушующий сотни лет.'
    ]
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    russianName: 'Сатурн',
    type: 'gas_giant',
    typeName: 'Газовый гигант',
    semiMajorAxisAU: 9.537070,
    semiMajorAxisKm: 1433530000,
    eccentricity: 0.05415,
    orbitalPeriodDays: 10759.22,
    orbitalSpeedKmS: 9.69,
    inclinationDeg: 2.484,
    radiusKm: 58232,
    massKg: 5.6834e26,
    massFormatted: '5.683 × 10²⁶ кг',
    densityGCm3: 0.69,
    surfaceGravityMS2: 10.44,
    rotationPeriodHours: 10.656,
    axialTiltDeg: 26.73,
    colorHex: '#f1c40f',
    rings: {
      innerRadiusKm: 66900,
      outerRadiusKm: 136775
    },
    interestingFacts: [
      'Обладает наиболее развитой и зрелищной системой колец из ледяных частиц и силикатной пыли.',
      'Средняя плотность Сатурна меньше плотности воды: он мог бы плавать на поверхности огромного океана.'
    ]
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    russianName: 'Уран',
    type: 'ice_giant',
    typeName: 'Ледяной гигант',
    semiMajorAxisAU: 19.19126,
    semiMajorAxisKm: 2872460000,
    eccentricity: 0.04717,
    orbitalPeriodDays: 30685.4,
    orbitalSpeedKmS: 6.81,
    inclinationDeg: 0.772,
    radiusKm: 25362,
    massKg: 8.681e25,
    massFormatted: '8.681 × 10²⁵ кг',
    densityGCm3: 1.27,
    surfaceGravityMS2: 8.69,
    rotationPeriodHours: -17.24,
    axialTiltDeg: 97.77,
    colorHex: '#74b9ff',
    interestingFacts: [
      'Вращается практически «лёжа на боку»: наклон оси вращения к плоскости орбиты составляет около 97.8°.',
      'Имеет самую холодную планетарную атмосферу в Солнечной системе с температурами до -224 °C.'
    ]
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    russianName: 'Нептун',
    type: 'ice_giant',
    typeName: 'Ледяной гигант',
    semiMajorAxisAU: 30.06896,
    semiMajorAxisKm: 4495060000,
    eccentricity: 0.0086,
    orbitalPeriodDays: 60189.0,
    orbitalSpeedKmS: 5.43,
    inclinationDeg: 1.769,
    radiusKm: 24622,
    massKg: 1.02413e26,
    massFormatted: '1.024 × 10²⁶ кг',
    densityGCm3: 1.64,
    surfaceGravityMS2: 11.15,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    colorHex: '#0984e3',
    interestingFacts: [
      'На Нептуне зафиксированы самые сильные ветры среди всех планет — их скорость достигает 2100 км/ч.',
      'Был открыт в 1846 году благодаря математическим расчётам гравитационных возмущений орбиты Урана.'
    ]
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    russianName: 'Плутон',
    type: 'dwarf',
    typeName: 'Карликовая планета',
    semiMajorAxisAU: 39.482,
    semiMajorAxisKm: 5906380000,
    eccentricity: 0.2488,
    orbitalPeriodDays: 90560,
    orbitalSpeedKmS: 4.74,
    inclinationDeg: 17.16,
    radiusKm: 1188.3,
    massKg: 1.303e22,
    massFormatted: '1.303 × 10²² кг',
    densityGCm3: 1.88,
    surfaceGravityMS2: 0.62,
    rotationPeriodHours: -153.28,
    axialTiltDeg: 122.53,
    colorHex: '#c7b299',
    interestingFacts: [
      'В 2006 году Международный астрономический союз переквалифицировал Плутон из статуса девятой планеты в карликовую планету.',
      'Сердце Плутона (равнина Спутника) — гигантский ледник из азотного льда размером около 1000 км.'
    ]
  }
}
