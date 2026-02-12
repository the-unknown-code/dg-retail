<template>
  <div class="controller-ui">
    <div ref="$wheelLeft" class="controller-ui--wheel left">
      <!-- semicircle stroke -->
      <svg class="arc" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M 0 50 A 50 50 0 0 1 100 50" fill="none" stroke="white" stroke-width=".3" />
      </svg>
      <div ref="$dotLeft" class="dot" />
    </div>

    <div ref="$wheelRight" class="controller-ui--wheel right">
      <!-- semicircle stroke -->
      <svg class="arc" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M 0 50 A 50 50 0 0 1 100 50" fill="none" stroke="white" stroke-width=".3" />
      </svg>
      <div ref="$dotRight" class="dot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
  value: 64
}

const rightState = {
  angle: Math.PI / 2,
  value: 64
}

// shared wheel controller
const createWheelController = (
  wheelEl: HTMLDivElement,
  dotEl: HTMLDivElement,
  state: { angle: number; value: number },
  side: 'left' | 'right'
): void => {
  let cx = 0
  let cy = 0
  let radius = 0

  const updateDot = (side: 'left' | 'right'): void => {
    const px = cx + radius * Math.cos(state.angle)
    const py = cy - radius * Math.sin(state.angle)
    gsap.set(dotEl, { x: px, y: py })

    state.value = Number(gsap.utils.mapRange(Math.PI, 0, 0, 127, state.angle).toFixed(2))

    // 🔥 get global position of the dot (viewport space)
    const dotRect = dotEl.getBoundingClientRect()

    const centerX = dotRect.left + dotRect.width / 2
    const centerY = dotRect.top + dotRect.height / 2

    // 🔥 normalize to WebGL NDC using WINDOW size
    const ndcX = (centerX / window.innerWidth) * 2 - 1
    const ndcY = (centerY / window.innerHeight) * 2 - 1

    if (side === 'left') {
      $store.updateChannel(2, state.value, ndcX * 0.75, ndcY)
    } else {
      $store.updateChannel(3, state.value, ndcX * 0.75, ndcY)
    }
  }

  const rect = wheelEl.getBoundingClientRect()

  cx = rect.width / 2
  cy = rect.height
  radius = Math.min(rect.width / 2, rect.height) - 16

  updateDot(side)

  Draggable.create(dotEl, {
    type: 'x,y',

    onPress() {
      dotEl.style.cursor = 'grabbing'
    },

    onDrag() {
      const rect = wheelEl.getBoundingClientRect()
      const mx = this.pointerX - rect.left
      const my = this.pointerY - rect.top

      let angle = Math.atan2(cy - my, mx - cx)
      angle = gsap.utils.clamp(0, Math.PI, angle)

      state.angle = angle
      updateDot(side)
    },

    onRelease() {
      dotEl.style.cursor = 'grab'

      gsap.to(state, {
        angle: Math.PI / 2,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: () => updateDot(side)
      })
    }
  })
}

const initialize = (): void => {
  if (!$wheelLeft.value || !$dotLeft.value || !$wheelRight.value || !$dotRight.value) return

  createWheelController($wheelLeft.value, $dotLeft.value, leftState, 'left')
  createWheelController($wheelRight.value, $dotRight.value, rightState, 'right')
}

tryOnMounted(initialize)
</script>

<style lang="scss" scoped>
.controller-ui {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;

  &--wheel {
    position: absolute;
    width: 40%;
    aspect-ratio: 1.5;
    bottom: 0;
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
      width: 32px;
      height: 32px;
      background: #ff3b3b;
      border-radius: 50%;
      position: absolute;
      cursor: grab;
      touch-action: none;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
