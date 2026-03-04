<script setup lang="ts"></script>

<template>
  <div class="jogwheel-fx">
    <div ref="$left" class="jogwheel-fx__inner left"></div>
    <div ref="$right" class="jogwheel-fx__inner right"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import { EVENTS } from '@renderer/libs/@gl/libs/Const'
import { tryOnMounted } from '@vueuse/core'
import gsap from 'gsap/all'
import { useAppStore } from '@renderer/store'

const $store = useAppStore()
const $emitter = inject('emitter')
const $left = ref<HTMLDivElement>()
const $right = ref<HTMLDivElement>()

let countLeft = 0
let countRight = 0

const addCircle = (id: number): void => {
  if (id === 2 && countLeft > 5) return
  if (id === 3 && countRight > 5) return

  const circle = document.createElement('div')
  circle.classList.add('circle')

  if (id === 2) {
    countLeft++
    $left.value?.appendChild(circle)
  } else {
    countRight++
    $right.value?.appendChild(circle)
  }

  const timeline = gsap.timeline()

  timeline.to(circle, {
    scale: 2,
    duration: 4,
    ease: 'power4.out'
  })

  timeline.to(
    circle,
    {
      opacity: 0,
      duration: 2,
      ease: 'power2.out'
    },
    '-=3'
  )
}
let lastMessageTime = 0
let isFirstLeft = true
let isFirstRight = true
const THROTTLE_MS = 350

watch(
  () => $store.midiData[2].value,
  () => {
    if (isFirstLeft) {
      isFirstLeft = false
      return
    }
    const now = performance.now()
    if (now - lastMessageTime < THROTTLE_MS) return
    lastMessageTime = now
    addCircle(2)
  }
)

watch(
  () => $store.midiData[3].value,
  () => {
    if (isFirstRight) {
      isFirstRight = false
      return
    }
    const now = performance.now()
    if (now - lastMessageTime < THROTTLE_MS) return
    lastMessageTime = now
    addCircle(3)
  }
)

tryOnMounted(() => {
  $emitter.on(EVENTS.JOGWHEEL_FX, addCircle)
})
</script>

<style lang="scss">
.jogwheel-fx {
  position: absolute;
  top: 0;
  left: 50%;
  width: calc(100% - 256px);
  transform: translate(-50%, 35%);
  height: 100%;
  z-index: 99;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  > div {
    position: relative;
    width: 400px;
    aspect-ratio: 1;
  }

  .circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid #ffffff33;
    border-radius: 50%;
    background-color: #ffffff22;
    box-shadow:
      0 0 8px 2px #ffffff33,
      0 0 16px 2px rgba(15, 130, 159, 0.5);
    transform: scale(0.25);
  }
}
</style>
