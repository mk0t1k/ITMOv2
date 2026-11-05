<script setup lang="ts">
import type { CelestialBodyData } from '../data/celestialBodies'

interface Props {
  body: CelestialBodyData | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'resetView'): void
}>()
</script>

<template>
  <Transition name="slide-card">
    <div v-if="body" class="planet-card">
      <div class="card-header">
        <div class="header-titles">
          <span class="badge">{{ body.typeName }}</span>
          <h2 class="body-title">{{ body.russianName }}</h2>
          <span class="body-latin">{{ body.name }}</span>
        </div>
        <button
          type="button"
          class="close-btn"
          aria-label="Закрыть карточку"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="card-body">
        <div class="params-grid">
          <div class="param-item">
            <span class="param-label">Радиус</span>
            <span class="param-value">{{ body.realRadiusKm.toLocaleString('ru-RU') }} км</span>
          </div>

          <div class="param-item">
            <span class="param-label">Дистанция от Солнца</span>
            <span class="param-value">
              {{ body.realDistanceMillionKm > 0 ? `${body.realDistanceMillionKm} млн км` : 'Центр системы' }}
            </span>
          </div>

          <div class="param-item">
            <span class="param-label">Период обращения</span>
            <span class="param-value">
              {{ body.id === 'sun' ? '—' : `${body.orbitalPeriod} дн.` }}
            </span>
          </div>

          <div class="param-item">
            <span class="param-label">Масса</span>
            <span class="param-value mass-value">{{ body.massKg }}</span>
          </div>
        </div>

        <div class="facts-section">
          <h3 class="facts-title">Интересные факты</h3>
          <ul class="facts-list">
            <li v-for="(fact, index) in body.interestingFacts" :key="index" class="fact-item">
              {{ fact }}
            </li>
          </ul>
        </div>
      </div>

      <div class="card-footer">
        <button type="button" class="action-btn" @click="emit('resetView')">
          <span>Сбросить вид системы</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.planet-card {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 360px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: rgba(13, 20, 36, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(80, 140, 240, 0.35);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55), 0 0 24px rgba(60, 120, 220, 0.15);
  color: #e6edf3;
  z-index: 20;
  overflow: hidden;
  user-select: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(80, 140, 240, 0.18);
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  display: inline-block;
  align-self: flex-start;
  font-family: var(--mono, monospace);
  font-size: 11px;
  color: #00ffcc;
  background: rgba(0, 255, 204, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.body-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.body-latin {
  font-family: var(--mono, monospace);
  font-size: 12px;
  color: #8b949e;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.card-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.params-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.param-label {
  font-size: 11px;
  color: #8b949e;
}

.param-value {
  font-family: var(--mono, monospace);
  font-size: 13px;
  font-weight: 600;
  color: #58a6ff;
}

.mass-value {
  font-size: 11px;
  line-height: 1.3;
}

.facts-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.facts-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #c9d1d9;
}

.facts-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fact-item {
  position: relative;
  font-size: 12.5px;
  line-height: 1.45;
  color: #c9d1d9;
  padding-left: 14px;
}

.fact-item::before {
  content: '•';
  position: absolute;
  left: 2px;
  color: #00ffcc;
}

.card-footer {
  padding: 14px 20px;
  border-top: 1px solid rgba(80, 140, 240, 0.18);
}

.action-btn {
  width: 100%;
  padding: 9px 14px;
  background: rgba(30, 60, 120, 0.45);
  border: 1px solid rgba(88, 166, 255, 0.4);
  border-radius: 8px;
  color: #ffffff;
  font-family: var(--mono, monospace);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(40, 90, 180, 0.6);
  border-color: #00ffcc;
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.25);
}

/* Glassmorphism Slide Transition */
.slide-card-enter-active,
.slide-card-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-card-enter-from,
.slide-card-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
