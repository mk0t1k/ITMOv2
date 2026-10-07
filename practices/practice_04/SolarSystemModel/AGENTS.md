# AGENTS.md — Архитектура и правила проекта Solar System 3D

> **Solar System 3D** — интерактивная веб-модель Солнечной системы на Vue 3 и Three.js, симулирующая орбитальное движение планет с возможностью исследования каждого небесного тела в реальном времени.

---

## 1. Навигация и Контракты
- **Спецификация требований и фич:** `docs/requirements.md`
- **Команда полной валидации проекта:** `sh scripts/check.sh`
- **Тестовый раннер:** `npm run test` (Vitest / Playwright)

> **Правило для агента:** 
> - Не модифицируй `docs/requirements.md` и `scripts/check.sh` без явного указания.
> - Не приступай к реализации **Фичи Б**, пока не принята, протестирована и верифицирована **Фича А**.

---

## 2. Стек Технологий
- **Фреймворк:** Vue 3 (Composition API, `<script setup>`, TypeScript)
- **3D Графика:** Three.js (WebGL-рендерер, OrbitControls)
- **Сборщик:** Vite
- **Стили:** Scoped CSS / CSS-переменные (минималистичный Sci-Fi UI)
- **Тестирование:** Vitest (математика орбит, данные), Playwright (E2E рендер холста)

---

## 3. Архитектура Проекта

```text
solar-system/
├── docs/
│   └── requirements.md         # Детальный контракт требований (Фичи А и Б)
├── scripts/
│   ├── check.sh                # Единый раннер проверок (типы, линт, билд, тесты)
│   └── test_canvas.mjs         # E2E скрипт проверки инициализации WebGL
├── src/
│   ├── data/
│   │   └── celestialBodies.ts  # Характеристики планет (масштабы, периоды, радиусы)
│   ├── core/
│   │   ├── SolarScene.ts       # Three.js сцена, камера, рендерер, свет, resize loop
│   │   ├── OrbitCalculator.ts  # Расчёт позиций по времени t (кеплеровы/круговые орбиты)
│   │   └── RaycasterManager.ts # Raycasting для кликов и hover-эффектов
│   ├── components/
│   │   ├── CanvasViewport.vue  # Холст Three.js
│   │   ├── PlanetCard.vue      # Информационная шторка выбранной планеты (Фича Б)
│   │   ├── TimeControls.vue    # Скорость времени, пауза/старт (Фича Б)
│   │   └── SystemOverview.vue  # Быстрый список планет для навигации
│   ├── composables/
│   │   └── useSolarSimulation.ts # Реактивное состояние симуляции (Vue Pinia/Composable)
│   ├── App.vue                 # Корневой лейаут
│   └── main.ts                 # Точка входа
├── tests/
│   ├── orbit_math.spec.ts      # Тесты физики и интерполяции орбит
│   └── e2e_render.spec.ts      # Playwright E2E тест
├── AGENTS.md                   # Навигация и правила проекта (этот файл)
└── package.json
```

## 4 Скрипты и Проверка

Единый проверочный скрипт

```bash
sh scripts/check.sh
# или
npm run check
```

Запуск и тестирование

```bash
# Режим разработки
npm run dev

# Проверка типов без сборки
npm run typecheck

# Сборка продакшн бандла
npm run build

# Юнит и E2E тесты
npm run test
npm run test:e2e
```