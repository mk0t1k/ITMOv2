<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  type EventType,
  type PlannerUIState,
  type EventSearchParams,
  type EventSearchResult,
  findAstronomicalEvent,
  ERROR_MESSAGES_RU
} from '../core/astronomicalEvents'
import type { CelestialBodyData } from '../data/celestialBodies'

interface Props {
  currentSimulationTime?: number
  availablePlanets: CelestialBodyData[]
}

const props = withDefaults(defineProps<Props>(), {
  currentSimulationTime: 0
})

const emit = defineEmits<{
  (e: 'search', params: EventSearchParams): void
  (e: 'time-jump', targetTime: number | string): void
  (e: 'close'): void
}>()

// Filter available planets excluding the Sun
const selectablePlanets = computed(() => {
  return props.availablePlanets.filter(b => b.id !== 'sun')
})

const uiState = ref<PlannerUIState>('Idle')
const selectedEventType = ref<EventType>('conjunction')
const selectedPlanetIds = ref<string[]>(['earth', 'mars'])
const timeRangeDays = ref<number>(800)
const lastResult = ref<EventSearchResult | null>(null)

const minRequiredPlanets = computed(() => {
  return selectedEventType.value === 'parade' ? 3 : 2
})

const canSearch = computed(() => {
  return (
    uiState.value !== 'Calculating' &&
    selectedPlanetIds.value.length >= minRequiredPlanets.value &&
    timeRangeDays.value > 0 &&
    timeRangeDays.value <= 36500
  )
})

const isInputsDisabled = computed(() => {
  return uiState.value === 'Calculating'
})

const handleEventTypeChange = (type: EventType) => {
  if (isInputsDisabled.value) return
  selectedEventType.value = type

  // Auto-adjust default selections if needed
  if (type === 'parade' && selectedPlanetIds.value.length < 3) {
    selectedPlanetIds.value = ['venus', 'earth', 'mars']
  } else if ((type === 'conjunction' || type === 'opposition') && selectedPlanetIds.value.length < 2) {
    selectedPlanetIds.value = ['earth', 'mars']
  }
}

const togglePlanetSelection = (planetId: string) => {
  if (isInputsDisabled.value) return
  const index = selectedPlanetIds.value.indexOf(planetId)
  if (index >= 0) {
    selectedPlanetIds.value.splice(index, 1)
  } else {
    selectedPlanetIds.value.push(planetId)
  }
}

const executeSearch = () => {
  if (uiState.value === 'Calculating') return

  uiState.value = 'Calculating'

  const params: EventSearchParams = {
    eventType: selectedEventType.value,
    planetIds: [...selectedPlanetIds.value],
    startTime: props.currentSimulationTime,
    timeRangeDays: Number(timeRangeDays.value)
  }

  emit('search', params)

  // Use a slight timeout (or microtask) to allow UI radar animation to paint smoothly
  setTimeout(() => {
    try {
      const result = findAstronomicalEvent(params)
      lastResult.value = result

      if (result.status === 'FOUND') {
        uiState.value = 'Success'
      } else if (result.status === 'NOT_FOUND') {
        uiState.value = 'Empty'
      } else {
        uiState.value = 'Error'
      }
    } catch {
      uiState.value = 'Error'
    }
  }, 120)
}

const handleTimeJump = () => {
  if (uiState.value !== 'Success' || !lastResult.value || lastResult.value.time === null) return
  emit('time-jump', lastResult.value.time)
}

const handleRetry = () => {
  uiState.value = 'Idle'
  lastResult.value = null
}

const closePanel = () => {
  emit('close')
}

const formatDisplayDate = (isoStr?: string) => {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return isoStr
  }
}
</script>

<template>
  <aside class="planner-panel">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="title-wrap">
        <span class="header-icon">🪐</span>
        <h2 class="panel-title">Планетарные события</h2>
      </div>
      <button type="button" class="close-btn" title="Закрыть панель" @click="closePanel">
        ✕
      </button>
    </div>

    <div class="panel-body">
      <!-- Event Type Tabs -->
      <div class="field-group">
        <label class="group-label">Тип явления</label>
        <div class="type-selector">
          <button
            type="button"
            class="type-btn"
            :class="{ active: selectedEventType === 'conjunction' }"
            :disabled="isInputsDisabled"
            @click="handleEventTypeChange('conjunction')"
          >
            Соединение
          </button>
          <button
            type="button"
            class="type-btn"
            :class="{ active: selectedEventType === 'opposition' }"
            :disabled="isInputsDisabled"
            @click="handleEventTypeChange('opposition')"
          >
            Противостояние
          </button>
          <button
            type="button"
            class="type-btn"
            :class="{ active: selectedEventType === 'parade' }"
            :disabled="isInputsDisabled"
            @click="handleEventTypeChange('parade')"
          >
            Парад планет
          </button>
        </div>
      </div>

      <!-- Participating Planets Selection -->
      <div class="field-group">
        <div class="group-label-row">
          <label class="group-label">Участники</label>
          <span class="label-hint">
            мин. {{ minRequiredPlanets }} (выбрано {{ selectedPlanetIds.length }})
          </span>
        </div>
        <div class="planets-chip-grid">
          <button
            v-for="planet in selectablePlanets"
            :key="planet.id"
            type="button"
            class="planet-chip"
            :class="{ selected: selectedPlanetIds.includes(planet.id) }"
            :disabled="isInputsDisabled"
            @click="togglePlanetSelection(planet.id)"
          >
            <span class="planet-dot" :style="{ backgroundColor: `#${planet.color.toString(16).padStart(6, '0')}` }"></span>
            <span class="planet-name">{{ planet.russianName }}</span>
          </button>
        </div>
      </div>

      <!-- Forecast Range Input -->
      <div class="field-group">
        <label class="group-label" for="time-range-input">Горизонт прогноза (земных дней)</label>
        <div class="input-range-wrap">
          <input
            id="time-range-input"
            v-model.number="timeRangeDays"
            type="number"
            min="1"
            max="36500"
            class="sci-input"
            :disabled="isInputsDisabled"
          />
          <span class="range-unit">дней</span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="action-wrap">
        <button
          type="button"
          class="find-btn"
          :disabled="!canSearch || isInputsDisabled"
          @click="executeSearch"
        >
          <span v-if="uiState === 'Calculating'" class="spinner"></span>
          <span>{{ uiState === 'Calculating' ? 'Расчёт траекторий...' : 'Найти событие' }}</span>
        </button>
      </div>

      <!-- Dynamic State Views -->
      <section class="results-container">
        <!-- 1. Calculating State -->
        <div v-if="uiState === 'Calculating'" class="state-card calculating-card">
          <div class="radar-scan"></div>
          <p class="calculating-text">Анализ орбитальных секторов и угловых скоростей...</p>
        </div>

        <!-- 2. Success State -->
        <div v-else-if="uiState === 'Success' && lastResult" class="state-card success-card">
          <div class="success-header">
            <span class="badge badge-success">Найдено</span>
            <span class="angle-val">Δθ = {{ lastResult.minAngularDifferenceDeg }}°</span>
          </div>

          <h3 class="event-title">{{ lastResult.title }}</h3>

          <div class="event-details">
            <div class="detail-row">
              <span class="detail-lbl">Целевая дата:</span>
              <span class="detail-val date-highlight">{{ formatDisplayDate(lastResult.targetDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-lbl">Смещение времени:</span>
              <span class="detail-val">+{{ lastResult.time }} дн.</span>
            </div>
          </div>

          <button
            type="button"
            class="jump-btn"
            @click="handleTimeJump"
          >
            <span>⏩ Перемотать время к дате</span>
          </button>
        </div>

        <!-- 3. Empty State -->
        <div v-else-if="uiState === 'Empty'" class="state-card empty-card">
          <div class="empty-icon">🔭</div>
          <h4 class="empty-title">Событие не обнаружено</h4>
          <p class="empty-desc">
            В интервале {{ timeRangeDays }} дней выбранные тела не достигают требуемой конфигурации. Рекомендуется увеличить диапазон поиска.
          </p>
          <button type="button" class="secondary-btn" @click="handleRetry">
            Сбросить и настроить
          </button>
        </div>

        <!-- 4. Error State -->
        <div v-else-if="uiState === 'Error'" class="state-card error-card">
          <div class="error-icon">⚠️</div>
          <h4 class="error-title">Параметры некорректны</h4>
          <p class="error-desc">
            {{ lastResult?.errorMessage || (lastResult?.errorCode ? ERROR_MESSAGES_RU[lastResult.errorCode] : 'Ошибка проверки параметров.') }}
          </p>
          <button type="button" class="secondary-btn" @click="handleRetry">
            Исправить параметры
          </button>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.planner-panel {
  position: absolute;
  top: 76px;
  right: 20px;
  width: 360px;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background: rgba(13, 20, 36, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(80, 140, 240, 0.35);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 255, 204, 0.1);
  color: #c9d1d9;
  z-index: 100;
  overflow: hidden;
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(80, 140, 240, 0.2);
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
}

.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #ffffff;
}

.panel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-label {
  font-size: 11px;
  font-family: var(--mono, monospace);
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.label-hint {
  font-size: 10.5px;
  color: #58a6ff;
  font-family: var(--mono, monospace);
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: rgba(0, 0, 0, 0.35);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid rgba(80, 140, 240, 0.2);
}

.type-btn {
  background: transparent;
  border: none;
  padding: 6px 4px;
  font-size: 10.5px;
  font-family: var(--mono, monospace);
  color: #8b949e;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-btn:hover:not(:disabled) {
  color: #ffffff;
}

.type-btn.active {
  background: rgba(0, 255, 204, 0.15);
  color: #00ffcc;
  font-weight: 600;
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.2);
}

.type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.planets-chip-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.planet-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background: rgba(20, 32, 54, 0.6);
  border: 1px solid rgba(80, 140, 240, 0.25);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.planet-chip:hover:not(:disabled) {
  border-color: rgba(0, 255, 204, 0.5);
  background: rgba(25, 42, 70, 0.8);
}

.planet-chip.selected {
  background: rgba(0, 255, 204, 0.12);
  border-color: #00ffcc;
}

.planet-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.planet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.planet-name {
  font-size: 11.5px;
  color: #e6edf3;
  font-family: var(--mono, monospace);
  white-space: nowrap;
}

.input-range-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.sci-input {
  width: 100%;
  background: rgba(20, 32, 54, 0.7);
  border: 1px solid rgba(80, 140, 240, 0.3);
  border-radius: 8px;
  padding: 8px 50px 8px 12px;
  color: #ffffff;
  font-family: var(--mono, monospace);
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s ease;
}

.sci-input:focus {
  border-color: #00ffcc;
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.2);
}

.sci-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.range-unit {
  position: absolute;
  right: 12px;
  font-size: 11px;
  color: #8b949e;
  pointer-events: none;
  font-family: var(--mono, monospace);
}

.action-wrap {
  margin-top: 4px;
}

.find-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.2), rgba(0, 150, 255, 0.3));
  border: 1px solid #00ffcc;
  border-radius: 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--mono, monospace);
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(0, 255, 204, 0.2);
}

.find-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.35), rgba(0, 150, 255, 0.45));
  box-shadow: 0 6px 18px rgba(0, 255, 204, 0.35);
}

.find-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: rgba(80, 140, 240, 0.3);
  box-shadow: none;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #00ffcc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.results-container {
  min-height: 110px;
}

.state-card {
  padding: 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.calculating-card {
  background: rgba(20, 32, 54, 0.5);
  border: 1px dashed rgba(0, 255, 204, 0.3);
  align-items: center;
  text-align: center;
  padding: 20px 12px;
}

.radar-scan {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 204, 0.2);
  border-top-color: #00ffcc;
  animation: spin 1s infinite linear;
}

.calculating-text {
  margin: 0;
  font-size: 11px;
  color: #8b949e;
  font-family: var(--mono, monospace);
}

.success-card {
  background: rgba(16, 36, 44, 0.7);
  border: 1px solid rgba(0, 255, 204, 0.4);
}

.success-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--mono, monospace);
  font-weight: 700;
  text-transform: uppercase;
}

.badge-success {
  background: rgba(0, 255, 204, 0.2);
  color: #00ffcc;
  border: 1px solid rgba(0, 255, 204, 0.4);
}

.angle-val {
  font-family: var(--mono, monospace);
  font-size: 11.5px;
  color: #00ffcc;
  font-weight: 600;
}

.event-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-family: var(--mono, monospace);
}

.detail-lbl {
  color: #8b949e;
}

.detail-val {
  color: #ffffff;
}

.date-highlight {
  color: #00ffcc;
  font-weight: 600;
}

.jump-btn {
  margin-top: 4px;
  padding: 8px;
  background: rgba(0, 255, 204, 0.15);
  border: 1px solid #00ffcc;
  border-radius: 6px;
  color: #00ffcc;
  font-size: 11px;
  font-family: var(--mono, monospace);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.jump-btn:hover {
  background: rgba(0, 255, 204, 0.25);
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
}

.empty-card {
  background: rgba(30, 25, 20, 0.6);
  border: 1px solid rgba(255, 170, 0, 0.3);
  text-align: center;
  align-items: center;
}

.empty-icon {
  font-size: 24px;
}

.empty-title {
  margin: 0;
  font-size: 12.5px;
  color: #ffaa00;
}

.empty-desc {
  margin: 0;
  font-size: 11px;
  color: #8b949e;
  line-height: 1.4;
}

.error-card {
  background: rgba(40, 16, 20, 0.6);
  border: 1px solid rgba(255, 90, 90, 0.4);
  text-align: center;
  align-items: center;
}

.error-icon {
  font-size: 22px;
}

.error-title {
  margin: 0;
  font-size: 12.5px;
  color: #ff6b6b;
}

.error-desc {
  margin: 0;
  font-size: 11px;
  color: #e6edf3;
  line-height: 1.4;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #c9d1d9;
  padding: 6px 12px;
  font-size: 10.5px;
  font-family: var(--mono, monospace);
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

@media (max-width: 768px) {
  .planner-panel {
    right: 10px;
    left: 10px;
    width: auto;
    top: 70px;
  }
}
</style>
