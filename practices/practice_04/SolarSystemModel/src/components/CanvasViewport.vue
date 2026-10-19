<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { SolarScene, type ViewMode } from '../core/SolarScene'
import { PLANETS_DATA, SUN_DATA, type CelestialBodyData } from '../data/celestialBodies'
import type { HoverEventPayload } from '../core/RaycasterManager'
import PlanetCard from './PlanetCard.vue'
import TimeControls from './TimeControls.vue'

const containerRef = ref<HTMLDivElement | null>(null)
// В соответствии с style-guide.md Three.js инстанс SolarScene оборачивается в shallowRef или чистую переменную
const solarSceneRef = shallowRef<SolarScene | null>(null)

const isPlaying = ref(true)
const timeSpeed = ref(1.0)
const viewMode = ref<ViewMode>('visual')
const selectedBody = ref<CelestialBodyData | null>(null)

// Тултип при hover
const tooltipData = ref<{
  visible: boolean
  name: string
  russianName: string
  x: number
  y: number
}>({
  visible: false,
  name: '',
  russianName: '',
  x: 0,
  y: 0
})

const handleHover = (payload: HoverEventPayload) => {
  if (payload.body) {
    tooltipData.value = {
      visible: true,
      name: payload.body.name,
      russianName: payload.body.russianName,
      x: payload.screenX,
      y: payload.screenY
    }
  } else {
    tooltipData.value.visible = false
  }
}

const handleSelect = (body: CelestialBodyData | null) => {
  selectedBody.value = body
}

const togglePlay = () => {
  if (!solarSceneRef.value) return
  isPlaying.value = solarSceneRef.value.toggleRunning()
}

const setSpeed = (spd: number) => {
  if (!solarSceneRef.value) return
  timeSpeed.value = spd
  solarSceneRef.value.setTimeSpeed(spd)
}

const setViewMode = (mode: ViewMode) => {
  if (!solarSceneRef.value) return
  viewMode.value = mode
  solarSceneRef.value.setViewMode(mode)
}

const selectFromList = (body: CelestialBodyData) => {
  if (!solarSceneRef.value) return
  solarSceneRef.value.selectBody(body)
}

const resetView = () => {
  if (!solarSceneRef.value) return
  solarSceneRef.value.resetView()
  selectedBody.value = null
}

const closeCard = () => {
  selectedBody.value = null
}

onMounted(() => {
  if (containerRef.value) {
    const scene = new SolarScene(containerRef.value)
    solarSceneRef.value = scene
    isPlaying.value = scene.getRunning()
    timeSpeed.value = scene.getTimeSpeed()
    viewMode.value = scene.getViewMode()

    scene.setEventCallbacks(
      payload => handleHover(payload),
      body => handleSelect(body)
    )
  }
})

onBeforeUnmount(() => {
  if (solarSceneRef.value) {
    solarSceneRef.value.destroy()
    solarSceneRef.value = null
  }
})
</script>

<template>
  <div class="viewport-wrapper">
    <!-- 3D WebGL Canvas Container -->
    <div ref="containerRef" class="canvas-container"></div>

    <!-- UI Overlay: Top Brand Bar -->
    <header class="top-brand-bar">
      <div class="brand-tag">
        <span class="pulse-indicator"></span>
        <span class="brand-title">SOLAR SYSTEM 3D</span>
      </div>

      <!-- Quick Nav for celestial bodies -->
      <nav class="quick-nav">
        <button
          type="button"
          class="quick-pill sun-pill"
          :class="{ active: selectedBody?.id === SUN_DATA.id }"
          @click="selectFromList(SUN_DATA)"
        >
          {{ SUN_DATA.russianName }}
        </button>
        <button
          v-for="p in PLANETS_DATA"
          :key="p.id"
          type="button"
          class="quick-pill"
          :class="{ active: selectedBody?.id === p.id }"
          @click="selectFromList(p)"
        >
          {{ p.russianName }}
        </button>
      </nav>

      <button
        v-if="selectedBody"
        type="button"
        class="reset-view-btn"
        @click="resetView"
      >
        <span class="icon">⌖</span>
        <span>Общий вид</span>
      </button>
    </header>

    <!-- Interactive Tooltip (Raycasting Hover) -->
    <div
      v-if="tooltipData.visible"
      class="celestial-tooltip"
      :style="{ left: `${tooltipData.x + 14}px`, top: `${tooltipData.y + 14}px` }"
    >
      <span class="tooltip-ru">{{ tooltipData.russianName }}</span>
      <span class="tooltip-en">{{ tooltipData.name }}</span>
    </div>

    <!-- Planet Information Card (Feature B) -->
    <PlanetCard
      :body="selectedBody"
      @close="closeCard"
      @reset-view="resetView"
    />

    <!-- Time and View Mode Controls (Feature B) -->
    <TimeControls
      :is-playing="isPlaying"
      :time-speed="timeSpeed"
      :view-mode="viewMode"
      @toggle-play="togglePlay"
      @change-speed="setSpeed"
      @change-view-mode="setViewMode"
    />
  </div>
</template>

<style scoped>
.viewport-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #05070f;
}

.canvas-container {
  width: 100%;
  height: 100%;
  display: block;
}

.top-brand-bar {
  position: absolute;
  top: 16px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  pointer-events: none;
  z-index: 10;
}

.brand-tag {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(13, 20, 36, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(80, 140, 240, 0.35);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00ffcc;
  box-shadow: 0 0 10px #00ffcc;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.brand-title {
  font-family: var(--mono, monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #c9d1d9;
}

.quick-nav {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(13, 20, 36, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(80, 140, 240, 0.3);
  border-radius: 12px;
  overflow-x: auto;
  max-width: 60%;
}

.quick-pill {
  padding: 4px 10px;
  font-size: 11.5px;
  font-family: var(--mono, monospace);
  color: #8b949e;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.quick-pill:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.quick-pill.active {
  color: #00ffcc;
  background: rgba(0, 255, 204, 0.12);
  border-color: rgba(0, 255, 204, 0.4);
}

.sun-pill.active {
  color: #ffaa00;
  background: rgba(255, 170, 0, 0.15);
  border-color: rgba(255, 170, 0, 0.5);
}

.reset-view-btn {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(20, 35, 65, 0.8);
  border: 1px solid rgba(0, 255, 204, 0.4);
  border-radius: 10px;
  color: #00ffcc;
  font-family: var(--mono, monospace);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-view-btn:hover {
  background: rgba(30, 50, 95, 0.9);
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.3);
}

/* Tooltip */
.celestial-tooltip {
  position: fixed;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 12px;
  background: rgba(13, 20, 36, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 204, 0.4);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  z-index: 100;
  transform: translate(0, 0);
}

.tooltip-ru {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.tooltip-en {
  font-family: var(--mono, monospace);
  font-size: 10.5px;
  color: #00ffcc;
}

@media (max-width: 992px) {
  .top-brand-bar {
    flex-wrap: wrap;
  }
  .quick-nav {
    display: none;
  }
}
</style>
