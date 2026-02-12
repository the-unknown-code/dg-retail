<template>
  <div class="controller-ui">
    <div class="pin-audio" />
    <div ref="$wheelLeft" class="controller-ui--wheel left">
      <!-- semicircle stroke -->
      <svg class="arc" viewBox="0 0 100 50" preserveAspectRatio="none">
        <g transform="translate(0, 2.5)">
          <path
            d="M 0 50 A 50 50 0 0 1 100 50"
            fill="none"
            stroke="white"
            stroke-width="0.8"
            stroke-dasharray="1.5 2.5"
            stroke-linecap="round"
          />
        </g>
      </svg>
      <div ref="$dotLeft" class="dot">
        <span>{{ $store.midiData[2].value }}</span>
      </div>
    </div>

    <div ref="$wheelRight" class="controller-ui--wheel right">
      <!-- semicircle stroke -->
      <svg class="arc" viewBox="0 0 100 50" preserveAspectRatio="none">
        <g transform="translate(0, 2.5)">
          <path
            d="M 0 50 A 50 50 0 0 1 100 50"
            fill="none"
            stroke="white"
            stroke-width="0.8"
            stroke-dasharray="1.5 2.5"
            stroke-linecap="round"
          />
        </g>
      </svg>
      <div ref="$dotRight" class="dot">
        <span>{{ $store.midiData[3].value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { tryOnMounted } from '@vueuse/core'
import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import { useAppStore } from '@renderer/store'

const $store = useAppStore()

const $wheelLeft = ref<HTMLDivElement | null>(null)
const $dotLeft = ref<HTMLDivElement | null>(null)
const $wheelRight = ref<HTMLDivElement | null>(null)
const $dotRight = ref<HTMLDivElement | null>(null)

// 🎛️ independent state per wheel
const leftState = {
  angle: Math.PI / 2,
  value: 64,
  velocity: 0
}

const rightState = {
  angle: Math.PI / 2,
  value: 64,
  velocity: 0
}

// shared wheel controller
const createWheelController = (
  wheelEl: HTMLDivElement,
  dotEl: HTMLDivElement,
  state: { angle: number; value: number; velocity: number },
  side: 'left' | 'right'
): void => {
  let cx = 0
  let cy = 0
  let radius = 0

  // velocity tracking
  let lastAngle = state.angle
  let lastTime = performance.now()

  const updateDot = (): void => {
    // local wheel-space position
    const px = cx + radius * Math.cos(state.angle)
    const py = cy - radius * Math.sin(state.angle)
    gsap.set(dotEl, { x: px, y: py })

    // angle → MIDI value
    state.value = Number(gsap.utils.mapRange(Math.PI, 0, 0, 127, state.angle).toFixed(2))

    // 🔥 velocity (angular, radians/sec)
    const now = performance.now()
    const dt = Math.max(1, now - lastTime)
    const da = state.angle - lastAngle
    state.velocity = da / (dt / 1000)

    lastAngle = state.angle
    lastTime = now

    // 🔥 global dot position (viewport space)
    const dotRect = dotEl.getBoundingClientRect()
    const centerX = dotRect.left + dotRect.width / 2
    const centerY = dotRect.top + dotRect.height / 2

    // normalize to WebGL NDC (window-based)
    const ndcX = (centerX / window.innerWidth) * 2 - 1
    const ndcY = (centerY / window.innerHeight) * 2 - 1

    // send to store
    if (side === 'left') {
      $store.updateChannel(2, state.value, ndcX * 0.75, ndcY, state.velocity)
    } else {
      $store.updateChannel(3, state.value, ndcX * 0.75, ndcY, state.velocity)
    }
  }

  // 🔁 MIDI → UI (animated)
  const setFromMidiValue = (value: number): void => {
    const v = gsap.utils.clamp(0, 127, value)
    const targetAngle = gsap.utils.mapRange(0, 127, Math.PI, 0, v)

    gsap.to(state, {
      angle: targetAngle,
      duration: gsap.utils.clamp(0.1, 0.4, Math.abs(targetAngle - state.angle)),
      ease: 'power3.out',
      overwrite: 'auto',
      onUpdate: updateDot
    })
  }

  // initial geometry
  const rect = wheelEl.getBoundingClientRect()
  cx = rect.width / 2
  cy = rect.height
  radius = Math.min(rect.width / 2, rect.height) - 16

  updateDot()

  Draggable.create(dotEl, {
    type: 'x,y',

    onPress() {
      dotEl.style.cursor = 'grabbing'
      lastAngle = state.angle
      lastTime = performance.now()
    },

    onDrag() {
      const rect = wheelEl.getBoundingClientRect()
      const mx = this.pointerX - rect.left
      const my = this.pointerY - rect.top

      let angle = Math.atan2(cy - my, mx - cx)
      angle = gsap.utils.clamp(0, Math.PI, angle)

      state.angle = angle
      updateDot()
    },

    onRelease() {
      dotEl.style.cursor = 'grab'

      gsap.to(state, {
        angle: Math.PI / 2,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: updateDot
      })
    }
  })

  // 🔓 expose MIDI setter
  ;(dotEl as unknown as { __setFromMidiValue: (value: number) => void }).__setFromMidiValue =
    setFromMidiValue
}

// init both wheels
const initialize = (): void => {
  if (!$wheelLeft.value || !$dotLeft.value || !$wheelRight.value || !$dotRight.value) return

  createWheelController($wheelLeft.value, $dotLeft.value, leftState, 'left')
  createWheelController($wheelRight.value, $dotRight.value, rightState, 'right')
}

watch(
  () => $store.midiData[2].input,
  (value: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($dotLeft.value as any).__setFromMidiValue(value)
  }
)

watch(
  () => $store.midiData[3].input,
  (value: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($dotRight.value as any).__setFromMidiValue(value)
  }
)

tryOnMounted(initialize)

/* ------------------------------------------------------------------
   🎹 MIDI usage example
-------------------------------------------------------------------

($dotLeft.value as any).__setFromMidiValue(32)
($dotRight.value as any).__setFromMidiValue(100)

------------------------------------------------------------------- */
</script>

<style lang="scss" scoped>
.controller-ui {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;

  .pin-audio {
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 32px;
    background: #ff3b3b;
    border-radius: 50%;
  }

  &--wheel {
    position: absolute;
    width: 40%;
    aspect-ratio: 1.5;
    bottom: -10%;
    transform: scaleY(1);

    &.left {
      left: 5%;
    }
    &.right {
      right: 5%;
    }

    .arc {
      position: absolute;
      left: 0;
      bottom: 0;
      pointer-events: none; // 👈 important
    }

    .dot {
      width: 64px;
      height: 64px;
      background: #ff3b3b;
      border-radius: 50%;
      position: absolute;
      cursor: grab;
      touch-action: none;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: monospace;
    }
  }
}
</style>
