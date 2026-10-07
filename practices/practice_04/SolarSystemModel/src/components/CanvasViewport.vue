<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { SolarScene } from '../core/SolarScene'

const containerRef = ref<HTMLDivElement | null>(null)
let solarScene: SolarScene | null = null

const isPlaying = ref(true)

const togglePlay = () => {
  if (!solarScene) return
  isPlaying.value = solarScene.toggleRunning()
}

onMounted(() => {
  if (containerRef.value) {
    solarScene = new SolarScene(containerRef.value)
    isPlaying.value = solarScene.getRunning()
  }
})

onBeforeUnmount(() => {
  if (solarScene) {
    solarScene.destroy()
    solarScene = null
  }
})
</script>

<template>
  <div class="viewport-wrapper">
    <!-- 3D WebGL Canvas Container -->
    <div ref="containerRef" class="canvas-container"></div>

    <!-- UI Overlay: Control Bar -->
    <div class="control-panel">
      <div class="brand-tag">
        <span class="pulse-indicator"></span>
        <span class="brand-title">SOLAR SYSTEM 3D</span>
      </div>

      <button
        type="button"
        class="sci-fi-btn"
        :class="{ active: isPlaying }"
        @click="togglePlay"
      >
        <span class="icon">{{ isPlaying ? '⏸' : '▶' }}</span>
        <span>{{ isPlaying ? 'Пауза' : 'Старт' }}</span>
      </button>
    </div>
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

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  background: rgba(13, 17, 28, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(80, 120, 200, 0.25);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  z-index: 10;
  user-select: none;
}

.brand-tag {
  display: flex;
  align-items: center;
  gap: 8px;
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

.sci-fi-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-family: var(--mono, monospace);
  font-size: 13px;
  color: #e6edf3;
  background: rgba(40, 50, 75, 0.5);
  border: 1px solid rgba(100, 160, 255, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.sci-fi-btn:hover {
  background: rgba(60, 90, 140, 0.6);
  border-color: #00ffcc;
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.3);
  color: #ffffff;
}

.sci-fi-btn.active {
  border-color: rgba(0, 255, 204, 0.6);
}

.icon {
  font-size: 11px;
}
</style>
