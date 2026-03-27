<template>
  <div :class="['controller-sound', { 'is-ipad': $store.isIpad }]">
    <div :class="['controller-sound__grid', { 'is-mobile': $store.isMobile }]">
      <div
        v-for="i in $store.isMobile ? 4 : 16"
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
import gsap from 'gsap/all'
import { ref, watch } from 'vue'
export type CornerZone = 'TL' | 'TR' | 'BL' | 'BR' | null

const props = defineProps<{
  soundCallback: (index: number | null) => void
}>()

const $store = useAppStore()

const SOUND_GRID = $store.isMobile
  ? {
      1: { label: 'B3', color: '#ffb3f4' },
      2: { label: 'B4', color: '#c9daf8' },
      3: { label: 'B1', color: '#f5c5c5' },
      4: { label: 'B2', color: '#b6d7a8' }
    }
  : {
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

const $pin = ref<HTMLDivElement | null>(null)

const pinState = { x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0 }
const currentGridIndex = ref<number | null>(null)
const currentCorner = ref<CornerZone>(null)

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

const CORNER_THRESHOLD = 0.15 // 0 = only at edge, 1 = whole screen — tweak to taste

const getCornerZone = (x: number | null = null, y: number | null = null): CornerZone => {
  const px = x ?? pinState.x
  const py = y ?? pinState.y

  const padding = 50
  const nx = px / (bounds.x - padding) // -1 to 1
  const ny = py / (bounds.y - padding) // -1 to 1

  const inCorner = Math.abs(nx) > CORNER_THRESHOLD && Math.abs(ny) > CORNER_THRESHOLD

  if (!inCorner) return null

  if (nx < 0 && ny < 0) return 'TL'
  if (nx > 0 && ny < 0) return 'TR'
  if (nx < 0 && ny > 0) return 'BL'
  return 'BR'
}

const getGridIndex = (x: number | null = null, y: number | null = null): number | null => {
  const w = window.innerWidth
  const h = window.innerHeight

  const px = x ? x : pinState.x
  const py = y ? y : pinState.y

  const centerX = w / 2 + px
  const centerY = h / 2 + py

  const gridSize = $store.isMobile ? 2 : 4 // ← add this

  const corners = [
    { x: centerX - PIN_SIZE / 2, y: centerY - PIN_SIZE / 2 },
    { x: centerX + PIN_SIZE / 2, y: centerY - PIN_SIZE / 2 },
    { x: centerX + PIN_SIZE / 2, y: centerY + PIN_SIZE / 2 },
    { x: centerX - PIN_SIZE / 2, y: centerY + PIN_SIZE / 2 }
  ]

  for (const corner of corners) {
    const col = Math.floor((corner.x / w) * gridSize) // ← was hardcoded 4
    const row = Math.floor((corner.y / h) * gridSize) // ← was hardcoded 4

    if (col >= 0 && col <= gridSize - 1 && row >= 0 && row <= gridSize - 1) {
      // ← was 3
      return row * gridSize + col + 1 // ← was row * 4 + col + 1
    }
  }

  return null
}

const applyMovement = (rawValue: number, axis: 'x' | 'y'): void => {
  const delta = rawValue - 64
  const speed = (delta / 64) * 36
  const padding = 50

  /*
  if (axis === 'x') {
    pinState.x = Math.max(-bounds.x, Math.min(bounds.x, pinState.x + speed))
  } else {
    pinState.y = Math.max(-bounds.y, Math.min(bounds.y, pinState.y + speed))
  }
    */

  if (axis === 'x') {
    pinState.x = Math.max(-(bounds.x - padding), Math.min(bounds.x - padding, pinState.x + speed))
  } else {
    pinState.y = Math.max(-(bounds.y - padding), Math.min(bounds.y - padding, pinState.y + speed))
  }

  // Calculate normalized coordinates nx and ny from -1 to 1
  /*
  pinState.nx = pinState.x / bounds.x
  pinState.ny = pinState.y / bounds.y
  */
  pinState.nx = pinState.x / (bounds.x - padding)
  pinState.ny = pinState.y / (bounds.y - padding)

  if (!$store.isIpad) {
    $store.pinState = { ...pinState }
  }

  currentGridIndex.value = getGridIndex()
  currentCorner.value = getCornerZone()
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

watch(currentCorner, (value) => {
  $store.currentCorner = value
})

watch(
  () => $store.pinState,
  () => {
    if ($store.appState === APP_STATE.MIXING && $store.isIpad) {
      if (!$pin.value) return

      if (!$store.isIpad) {
        $pin.value.style.transform = `translate(${$store.pinState.x}px, ${$store.pinState.y}px)`
        currentGridIndex.value = getGridIndex($store.pinState.x, $store.pinState.y)
      } else {
        const y = gsap.utils.mapRange(
          -window.innerHeight / 2,
          0,
          -window.innerHeight / 2,
          window.innerHeight / 2,
          $store.pinState.y
        )

        $pin.value.style.transform = `translate(${$store.pinState.x}px, ${y}px)`
        currentGridIndex.value = getGridIndex($store.pinState.x, y)
      }
    }
  }
)

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

    &.is-mobile {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }

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
