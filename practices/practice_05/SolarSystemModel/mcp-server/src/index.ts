#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { ASTRONOMICAL_CATALOG } from './data/catalog.js'
import { calculateOrbitPosition, scaleSolarSystem, solveKepler } from './math/orbital.js'

const server = new Server(
  {
    name: 'solar-ephemeris-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
)

// Список ресурсов
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = Object.values(ASTRONOMICAL_CATALOG).map(body => ({
    uri: `astronomy://bodies/${body.id}`,
    name: `${body.russianName} (${body.name}) - Астрономический профиль`,
    mimeType: 'application/json',
    description: `Научные параметры небесного тела ${body.russianName}: масса, радиус, период, плотность и факты`
  }))

  return { resources }
})

// Чтение ресурса
server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri
  const match = uri.match(/^astronomy:\/\/bodies\/([a-z0-9_-]+)$/)

  if (!match) {
    throw new Error(`Unsupported resource URI: ${uri}`)
  }

  const bodyId = match[1]
  const body = ASTRONOMICAL_CATALOG[bodyId]

  if (!body) {
    throw new Error(`Body not found in catalog: ${bodyId}`)
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(body, null, 2)
      }
    ]
  }
})

// Список инструментов
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_body_info',
        description: 'Возвращает полную научную астрономическую информацию о небесном теле (масса, радиус, период обращения, факты и т.д.)',
        inputSchema: {
          type: 'object',
          properties: {
            bodyId: {
              type: 'string',
              description: 'Идентификатор тела (sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto)'
            }
          },
          required: ['bodyId']
        }
      },
      {
        name: 'list_all_bodies',
        description: 'Возвращает список всех доступных в каталоге небесных тел с базовыми характеристиками',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'compute_kepler_position',
        description: 'Вычисляет точную кеплерову орбитальную позицию (x, y, z) тела по его эксцентриситету, большой полуоси и углу/времени',
        inputSchema: {
          type: 'object',
          properties: {
            bodyId: {
              type: 'string',
              description: 'Идентификатор тела'
            },
            timeOrAngleRad: {
              type: 'number',
              description: 'Угол истинной аномалии в радианах или параметр орбитального времени'
            }
          },
          required: ['bodyId', 'timeOrAngleRad']
        }
      },
      {
        name: 'get_scaled_system_data',
        description: 'Генерирует готовые коэффициенты масштабирования для Three.js сцены (стилизованный или реалистичный режим)',
        inputSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['stylized', 'realistic'],
              description: 'Режим масштабирования: stylized (визуальный читаемый) или realistic (пропорциональный)'
            }
          },
          required: ['mode']
        }
      },
      {
        name: 'validate_orbit_timing',
        description: 'Валидирует кинематику орбитальных скоростей (3-й закон Кеплера: T^2 пропорционален a^3), проверяя соответствие периодов расстояниям',
        inputSchema: {
          type: 'object',
          properties: {
            bodyId: {
              type: 'string',
              description: 'Идентификатор тела'
            }
          },
          required: ['bodyId']
        }
      }
    ]
  }
})

// Обработка вызова инструментов
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'get_body_info': {
      const bodyId = String(args?.bodyId).toLowerCase()
      const body = ASTRONOMICAL_CATALOG[bodyId]
      if (!body) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Ошибка: тело '${bodyId}' не найдено. Доступные: ${Object.keys(ASTRONOMICAL_CATALOG).join(', ')}`
            }
          ]
        }
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(body, null, 2)
          }
        ]
      }
    }

    case 'list_all_bodies': {
      const summary = Object.values(ASTRONOMICAL_CATALOG).map(b => ({
        id: b.id,
        name: b.name,
        russianName: b.russianName,
        type: b.typeName,
        distanceAU: b.semiMajorAxisAU,
        orbitalPeriodDays: b.orbitalPeriodDays,
        radiusKm: b.radiusKm
      }))
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summary, null, 2)
          }
        ]
      }
    }

    case 'compute_kepler_position': {
      const bodyId = String(args?.bodyId).toLowerCase()
      const angle = Number(args?.timeOrAngleRad ?? 0)
      const body = ASTRONOMICAL_CATALOG[bodyId]
      if (!body) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Неизвестное тело: ${bodyId}` }]
        }
      }

      if (bodyId === 'sun') {
        return {
          content: [{ type: 'text', text: JSON.stringify({ x: 0, y: 0, z: 0, distance: 0 }, null, 2) }]
        }
      }

      const inclRad = (body.inclinationDeg * Math.PI) / 180
      const pos = calculateOrbitPosition(body.semiMajorAxisAU, body.eccentricity, angle, inclRad)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                body: body.name,
                semiMajorAxisAU: body.semiMajorAxisAU,
                eccentricity: body.eccentricity,
                positionAU: {
                  x: +pos.x.toFixed(4),
                  y: +pos.y.toFixed(4),
                  z: +pos.z.toFixed(4)
                },
                distanceFromSunAU: +pos.distance.toFixed(4)
              },
              null,
              2
            )
          }
        ]
      }
    }

    case 'get_scaled_system_data': {
      const mode = args?.mode === 'realistic' ? 'realistic' : 'stylized'
      const data = scaleSolarSystem(mode)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      }
    }

    case 'validate_orbit_timing': {
      const bodyId = String(args?.bodyId).toLowerCase()
      const body = ASTRONOMICAL_CATALOG[bodyId]
      if (!body || bodyId === 'sun') {
        return {
          isError: true,
          content: [{ type: 'text', text: `Валидация применима только к планетам (меркурий-плутон)` }]
        }
      }

      // Закон Кеплера: a^3 / T^2 = const (для Солнечной системы в единицах AU и годах = 1)
      const periodYears = body.orbitalPeriodDays / 365.256
      const a3 = Math.pow(body.semiMajorAxisAU, 3)
      const t2 = Math.pow(periodYears, 2)
      const ratio = +(a3 / t2).toFixed(4)
      const isValid = Math.abs(ratio - 1.0) < 0.05

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                planet: body.name,
                semiMajorAxisAU: body.semiMajorAxisAU,
                orbitalPeriodYears: +periodYears.toFixed(3),
                keplerRatio_a3_over_t2: ratio,
                matchesKeplerThirdLaw: isValid,
                status: isValid ? 'VALID: Орбитальные параметры соответствуют физике' : 'WARNING: Отклонение от 3-го закона Кеплера'
              },
              null,
              2
            )
          }
        ]
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Solar Ephemeris MCP Server running on stdio')
}

main().catch(err => {
  console.error('Fatal server error:', err)
  process.exit(1)
})
