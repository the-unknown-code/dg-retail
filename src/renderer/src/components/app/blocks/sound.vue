<template>
  <div class="sound">
    <div class="sound__content">
      <p>VIBY</p>
      <p>PARTY</p>
      <p>CHILL</p>
      <p>JAZZY</p>
    </div>
    <div id="dot" ref="$dot">
      <img src="/assets/sound-dot.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@renderer/store'
import { useTimeoutFn } from '@vueuse/core'
import { ref, watch } from 'vue'

const $store = useAppStore()
const $dot = ref<HTMLDivElement | null>(null)

const reset = (): void => {
  if (!$dot.value) return
  $dot.value.classList.remove('is-active')
}
const { start, stop } = useTimeoutFn(reset, 1000, { immediate: false })

watch(
  () => $store.pinState,
  (value) => {
    if (!$dot.value) return
    $dot.value.style.transform = `translate(${value.x}px, ${value.y}px)`
  }
)

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

#dot img {
  animation: pulse 2.5s infinite ease-in-out;
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

  p {
    position: absolute;
    font-size: 20px;
    text-shadow: 0px 4px 10px 0px #0087c166;
    padding: 32px;

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
    opacity: 0.35;
    transition: opacity 0.5s ease-in-out;

    &.is-active {
      opacity: 1;
    }

    img {
      position: relative;
    }
  }
}
</style>
