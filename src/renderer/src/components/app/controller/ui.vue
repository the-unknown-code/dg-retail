<template>
  <div class="controller-ui">
    <div ref="$faderContainer" class="fader-container">
      <div ref="$faderDot" class="fader-container__dot" />
    </div>

    <div ref="$pinContainer" class="pin-container">
      <div ref="$pinDot" class="pin-container__dot" />
    </div>

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
import Tempus from 'tempus'

const props = defineProps<{
  soundCallback: (quadrantValues: {
    topLeft: number
    topRight: number
    bottomLeft: number
    bottomRight: number
  }) => void
}>()

const $store = useAppStore()

const $wheelLeft = ref<HTMLDivElement | null>(null)
const $dotLeft = ref<HTMLDivElement | null>(null)
const $wheelRight = ref<HTMLDivElement | null>(null)
const $dotRight = ref<HTMLDivElement | null>(null)

const $faderContainer = ref<HTMLDivElement | null>(null)
const $faderDot = ref<HTMLDivElement | null>(null)

const $pinContainer = ref<HTMLDivElement | null>(null)
const $pinDot = ref<HTMLDivElement | null>(null)

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
    state.value = Math.round(gsap.utils.mapRange(Math.PI, 0, 0, 127, state.angle))

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

/* --------------------------------------------------
   Pin physics state
-------------------------------------------------- */
const pinState = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0
}

/* --------------------------------------------------
   MIDI → velocity mapping
-------------------------------------------------- */
const DEADZONE = 2
const MAX_SPEED = 8

const midiToVelocity = (value: number): number => {
  const delta = value - 64
  if (Math.abs(delta) <= DEADZONE) return 0
  return (delta / 63) * MAX_SPEED
}

/* --------------------------------------------------
   Pac-Man wrap
-------------------------------------------------- */
const wrapPin = (): void => {
  if (!$pinContainer.value) return

  const rect = $pinContainer.value.getBoundingClientRect()
  const halfW = rect.width / 2
  const halfH = rect.height / 2

  if (pinState.x > halfW) pinState.x = -halfW
  if (pinState.x < -halfW) pinState.x = halfW

  if (pinState.y > halfH) pinState.y = -halfH
  if (pinState.y < -halfH) pinState.y = halfH
}

const renderPin = (): void => {
  if (!$pinDot.value) return

  gsap.set($pinDot.value, {
    x: pinState.x,
    y: pinState.y
  })
}

const getQuadrantValues = (): {
  topLeft: number
  topRight: number
  bottomLeft: number
  bottomRight: number
} => {
  if (!$pinContainer.value) {
    return {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    }
  }

  const rect = $pinContainer.value.getBoundingClientRect()
  const halfW = rect.width / 2
  const halfH = rect.height / 2

  // normalize to [-1, 1]
  const nx = gsap.utils.clamp(-1, 1, pinState.x / halfW)
  const ny = gsap.utils.clamp(-1, 1, pinState.y / halfH)

  // axis weights
  const left = (1 - nx) * 0.5
  const right = (1 + nx) * 0.5
  const top = (1 - ny) * 0.5
  const bottom = (1 + ny) * 0.5

  return {
    topLeft: top * left,
    topRight: top * right,
    bottomLeft: bottom * left,
    bottomRight: bottom * right
  }
}

const tick = (): void => {
  pinState.x += pinState.vx
  pinState.y += pinState.vy

  const quadrantValues = getQuadrantValues()
  props.soundCallback(quadrantValues)

  wrapPin()
  renderPin()
}

const createAudioController = (): void => {
  if (!$pinContainer.value || !$pinDot.value) return
  Tempus.add(tick, { priority: -1 })
}

// FADER

const createFaderController = (): void => {
  if (!$faderContainer.value || !$faderDot.value) return
  Draggable.create($faderDot.value, {
    type: 'y',
    bounds: $faderContainer.value,
    onDrag: function () {
      // Get progress from top (0) to bottom (1)
      const dot = $faderDot.value
      const container = $faderContainer.value
      if (!dot || !container) return
      const dotRect = dot.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      // Clamp to [0, 1]
      let progress = (dotRect.top - containerRect.top) / (containerRect.height - dotRect.height)
      progress = gsap.utils.clamp(0, 1, progress)
      $store.updateChannel(60, progress * 127, 0, 0, 0)
      // You can emit or use progress as needed
    }
  })
}

const setFaderFromMidi = (value: number): void => {
  if (!$faderContainer.value || !$faderDot.value) return

  const v = gsap.utils.clamp(0, 127, value)

  const container = $faderContainer.value
  const dot = $faderDot.value

  const containerRect = container.getBoundingClientRect()
  const dotRect = dot.getBoundingClientRect()

  const travel = containerRect.height - dotRect.height

  // MIDI 0 = top, 127 = bottom
  const y = gsap.utils.mapRange(0, 127, 0, travel, v)

  gsap.to(dot, {
    y,
    duration: 0.15,
    ease: 'power2.out',
    overwrite: 'auto'
  })
}

// init both wheels
const initialize = (): void => {
  if (!$wheelLeft.value || !$dotLeft.value || !$wheelRight.value || !$dotRight.value) return

  createWheelController($wheelLeft.value, $dotLeft.value, leftState, 'left')
  createWheelController($wheelRight.value, $dotRight.value, rightState, 'right')
  createAudioController()
  createFaderController()
}

watch(
  () => $store.midiData[60].input,
  (value: number) => {
    setFaderFromMidi(value)
  }
)

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

watch(
  () => $store.midiData[2].value,
  (value: number) => {
    pinState.vx = midiToVelocity(value)
  }
)

watch(
  () => $store.midiData[3].value,
  (value: number) => {
    pinState.vy = -midiToVelocity(value)
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

  .fader-container {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 2px;
    height: 150px;
    background-color: white;

    &__dot {
      position: absolute;
      left: -32px;
      top: 50%;
      margin-top: -12px;
      width: 64px;
      height: 24px;
      background: #ff3b3b;
      border-radius: 24px;
    }
  }

  .pin-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    border: 1px dashed #fff;

    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      width: 0;
      height: 100%;
      border-right: 1px dashed red;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 0;
      border-bottom: 1px dashed red;
    }

    &__dot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32px;
      height: 32px;
      background: red;
      border-radius: 50%;
      z-index: 1;
    }
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
