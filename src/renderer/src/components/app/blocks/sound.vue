<template>
  <div class="sound">
    <div v-if="!$store.isIpad" class="sound__content">
      <p>VIBY</p>
      <p>PARTY</p>
      <p>CHILL</p>
      <p>JAZZY</p>
    </div>
    <div id="dot" ref="$dot">
      <div />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@renderer/store'
import { tryOnBeforeUnmount, useTimeoutFn } from '@vueuse/core'
import Tempus from 'tempus'
import { lerp } from 'three/src/math/MathUtils.js'
import { ref, watch } from 'vue'

const $store = useAppStore()
const $dot = ref<HTMLDivElement | null>(null)

const reset = (): void => {
  if (!$dot.value) return
  $dot.value.classList.remove('is-active')
}

const position = { ...$store.pinState }
const { start, stop } = useTimeoutFn(reset, 1000, { immediate: false })
const cb = Tempus.add(
  () => {
    if (!$dot.value) return
    const x = lerp(position.x, $store.pinState.x, 0.5)
    const y = lerp(position.y, $store.pinState.y, 0.5)
    position.x = x
    position.y = y
    $dot.value.style.transform = `translate(${x}px, ${y}px)`
  },
  { priority: -1 }
)

/*
watch(
  () => $store.pinState,
  (value) => {
    if (!$dot.value) return
    $dot.value.style.transform = `translate(${value.x}px, ${value.y}px)`
  }
)
  */

watch(
  () => $store.midiData[2].value,
  () => {
    if (!$dot.value) return
    $dot.value.classList.add('is-active')
    stop()
    start()
  }
)

watch(
  () => $store.midiData[3].value,
  () => {
    if (!$dot.value) return
    $dot.value.classList.add('is-active')
    stop()
    start()
  }
)

tryOnBeforeUnmount(() => {
  cb?.()
})
</script>

<style lang="scss" scoped>
@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.75;
  }
  100% {
    transform: scale(0.5);
    opacity: 1;
  }
}

.sound {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  mix-blend-mode: lighten;
  pointer-events: none;
  z-index: 9999;

  p {
    position: absolute;
    font-size: 20px;
    text-shadow: 0px 4px 10px 0px #0087c166;
    padding: 64px;

    &:nth-child(1) {
      top: 0%;
      left: 0%;
    }
    &:nth-child(2) {
      top: 0%;
      right: 0%;
    }
    &:nth-child(3) {
      bottom: 0%;
      left: 0%;
    }
    &:nth-child(4) {
      bottom: 0%;
      right: 0%;
    }
  }

  #dot {
    position: absolute;
    transition: opacity 0.5s ease-in-out;
    width: 24px;
    height: 24px;

    &.is-active {
      > div {
        opacity: 1;
        transform: scale(1);
      }
    }

    > div {
      position: absolute;
      transition: opacity 0.5s ease-in-out;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px solid #fff;
      opacity: 0;
      background-color: #ffffff11;
      backdrop-filter: blur(5px);
      box-shadow:
        0 0 16px 4px #fff,
        0 0 32px 12px rgba(130, 227, 252, 0.5);
      transform: scale(0.5);
      transition:
        transform 0.5s ease-out,
        opacity 0.5s ease-out;
    }
  }
}
</style>
