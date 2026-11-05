<script setup lang="ts">
import type { ViewMode } from '../core/SolarScene'

interface Props {
  isPlaying: boolean
  timeSpeed: number
  viewMode: ViewMode
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'togglePlay'): void
  (e: 'changeSpeed', speed: number): void
  (e: 'changeViewMode', mode: ViewMode): void
}>()

const speedOptions = [0.25, 1, 2, 10, 50]
</script>

<template>
  <div class="time-controls-panel">
    <!-- Play / Pause Button -->
    <div class="section-group">
      <button
        type="button"
        class="sci-fi-btn play-btn"
        :class="{ active: isPlaying }"
        @click="emit('togglePlay')"
      >
        <span class="btn-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
        <span class="btn-text">{{ isPlaying ? 'Пауза' : 'Старт' }}</span>
      </button>
    </div>

    <div class="divider"></div>

    <!-- Speed Selector -->
    <div class="section-group speed-group">
      <span class="group-label">Скорость:</span>
      <div class="buttons-row">
        <button
          v-for="spd in speedOptions"
          :key="spd"
          type="button"
          class="sci-fi-pill"
          :class="{ active: timeSpeed === spd }"
          @click="emit('changeSpeed', spd)"
        >
          {{ spd }}x
        </button>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Scale Mode Toggle -->
    <div class="section-group mode-group">
      <span class="group-label">Масштаб:</span>
      <div class="buttons-row">
        <button
          type="button"
          class="sci-fi-pill"
          :class="{ active: viewMode === 'visual' }"
          @click="emit('changeViewMode', 'visual')"
        >
          Визуальный
        </button>
        <button
          type="button"
          class="sci-fi-pill"
          :class="{ active: viewMode === 'realistic' }"
          @click="emit('changeViewMode', 'realistic')"
        >
          Реалистичный
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-controls-panel {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 16px;
  background: rgba(13, 20, 36, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(80, 140, 240, 0.35);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(60, 120, 220, 0.15);
  z-index: 15;
  user-select: none;
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(80, 140, 240, 0.25);
}

.section-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-label {
  font-family: var(--mono, monospace);
  font-size: 11px;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.buttons-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sci-fi-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: var(--mono, monospace);
  font-size: 12px;
  color: #e6edf3;
  background: rgba(40, 50, 75, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.35);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.sci-fi-btn:hover {
  background: rgba(60, 90, 140, 0.6);
  border-color: #00ffcc;
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
  color: #ffffff;
}

.sci-fi-btn.active {
  border-color: rgba(0, 255, 204, 0.7);
}

.btn-icon {
  font-size: 11px;
}

.sci-fi-pill {
  padding: 5px 10px;
  font-family: var(--mono, monospace);
  font-size: 11.5px;
  color: #8b949e;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sci-fi-pill:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.sci-fi-pill.active {
  color: #00ffcc;
  background: rgba(0, 255, 204, 0.12);
  border-color: rgba(0, 255, 204, 0.4);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.2);
}

@media (max-width: 768px) {
  .time-controls-panel {
    bottom: 16px;
    flex-wrap: wrap;
    justify-content: center;
    width: 90%;
    max-width: 440px;
    gap: 8px;
    padding: 10px;
  }
  .divider {
    display: none;
  }
}
</style>
