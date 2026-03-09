<template>
  <div class="controller-sound">
    <div class="controller-sound__grid">
      <div
        v-for="i in 16"
        :key="i"
        :class="['controller-sound__grid-item', { 'is-active': currentGridIndex == i }]"
        :style="{ backgroundColor: SOUND_GRID[i] ? SOUND_GRID[i].color : '' }"
      >
        {{ SOUND_GRID[i] ? SOUND_GRID[i].label : '' }}
      </div>
    </div>
    <div id="pin" ref="$pin" />
  </div>
</template>

<script setup lang="ts">
import { APP_STATE } from '@renderer/libs/@global/const'
import { useAppStore } from '@renderer/store'
import { tryOnMounted } from '@vueuse/core'
import { ref, watch } from 'vue'

const props = defineProps<{
  soundCallback: (index: number | null) => void
}>()

const SOUND_GRID = {
  1: { label: 'B3', color: '#ffb3f4' },
  2: { label: 'B3_75-25_B4', color: '#efc6fe' },
  3: { label: 'B3_25-75_B4', color: '#e2ceff' },
  4: { label: 'B4', color: '#c9daf8' },
  5: { label: 'B1_25-75_B3', color: '#fdcddd' },
  6: { label: 'B3-75_B1-25_B4-25', color: '#ffffff' },
  7: { label: 'B4-75_B2-25_B3-25', color: '#fffeff' },
  8: { label: 'B2_25-75_B4', color: '#c9ffff' },
  9: { label: 'B1_75-25_B3', color: '#fccdc7' },
  10: { label: 'B1-75_B2-25_B4-25', color: '#ffffff' },
  11: { label: 'B2-75_B1-25_B3-25', color: '#ffffff' },
  12: { label: 'B2_75-25_B4', color: '#c0ffd0' },
  13: { label: 'B1', color: '#f5c5c5' },
  14: { label: 'B1_75-25_B2', color: '#ffe6cd' },
  15: { label: 'B1_25-75_B2', color: '#fdffce' },
  16: { label: 'B2', color: '#b6d7a8' }
}

const $store = useAppStore()
const $pin = ref<HTMLDivElement | null>(null)

const pinState = { x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0 }
const currentGridIndex = ref<number | null>(null)

// const DEAD_ZONE = 3
const PIN_SIZE = 32

// bounds updated on resize
const bounds = {
  x: window.innerWidth / 2 - PIN_SIZE / 2,
  y: window.innerHeight / 2 - PIN_SIZE / 2
}

const updateBounds = (): void => {
  bounds.x = window.innerWidth / 2 - PIN_SIZE / 2
  bounds.y = window.innerHeight / 2 - PIN_SIZE / 2
}

const updatePinPosition = (): void => {
  if (!$pin.value) return
  $pin.value.style.transform = `translate(${pinState.x}px, ${pinState.y}px)`
}

const getGridIndex = (): number | null => {
  const w = window.innerWidth
  const h = window.innerHeight

  const centerX = w / 2 + pinState.x
  const centerY = h / 2 + pinState.y

  const corners = [
    { x: centerX - PIN_SIZE / 2, y: centerY - PIN_SIZE / 2 },
    { x: centerX + PIN_SIZE / 2, y: centerY - PIN_SIZE / 2 },
    { x: centerX + PIN_SIZE / 2, y: centerY + PIN_SIZE / 2 },
    { x: centerX - PIN_SIZE / 2, y: centerY + PIN_SIZE / 2 }
  ]

  for (const corner of corners) {
    const col = Math.floor((corner.x / w) * 4)
    const row = Math.floor((corner.y / h) * 4)

    if (col >= 0 && col <= 3 && row >= 0 && row <= 3) {
      return row * 4 + col + 1
    }
  }

  return null
}

const applyMovement = (rawValue: number, axis: 'x' | 'y'): void => {
  const delta = rawValue - 64
  // if (Math.abs(delta) <= DEAD_ZONE) return

  const speed = (delta / 64) * 36

  if (axis === 'x') {
    pinState.x = Math.max(-bounds.x, Math.min(bounds.x, pinState.x + speed))
  } else {
    pinState.y = Math.max(-bounds.y, Math.min(bounds.y, pinState.y + speed))
  }

  // Calculate normalized coordinates nx and ny from -1 to 1
  pinState.nx = pinState.x / bounds.x
  pinState.ny = pinState.y / bounds.y

  $store.pinState = { ...pinState }
  updatePinPosition()
  currentGridIndex.value = getGridIndex()
}

watch(
  () => $store.midiData[2].value,
  (value) => {
    if ($store.appState !== APP_STATE.MIXING) return
    applyMovement(value, 'x')
  }
)

watch(
  () => $store.midiData[3].value,
  (value) => {
    if ($store.appState !== APP_STATE.MIXING) return
    applyMovement(value, 'y')
  }
)

watch(currentGridIndex, (value) => {
  props.soundCallback(value)
})

tryOnMounted(() => {
  updateBounds()
  updatePinPosition()
  currentGridIndex.value = getGridIndex()

  window.addEventListener('resize', updateBounds)

  window.addEventListener('keydown', (e) => {
    if (e.key === 's') {
      document.querySelector('.controller-sound')?.classList.toggle('is-visible')
    }
  })
})
</script>

<style lang="scss" scoped>
.controller-sound {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  display: none;

  &.is-visible {
    display: flex;
  }

  #pin {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -16px;
    margin-top: -16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: red;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    width: 100%;
    height: 100%;
    color: black;
    opacity: 0.25;

    > div {
      position: relative;
      border: 0.5px solid #00000022;
      background-color: #00000066;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 13px;

      &.is-active {
        border: 12px solid #ff0000 !important;
      }
    }
  }
}
</style>
