<template>
  <div class="midi">
    <div data-id="Fader CC1">{{ computedFader }}</div>
    <div data-id="Wheel Left CC2">{{ computedWheelLeft }}</div>
    <div data-id="Wheel Right CC3">{{ computedWheelRight }}</div>
    <div data-id="Button CC60">{{ computedButton }}</div>
    <div data-id="Connected?" :class="{ 'is-connected': midiFound }"></div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@renderer/store'
import { tryOnMounted } from '@vueuse/core'
import { computed } from 'vue'

const $store = useAppStore()
const midiFound = computed(() => $store.midiFound)
const computedFader = computed(() => $store.midiData[1].value)
const computedWheelLeft = computed(() => $store.midiData[2].value)
const computedWheelRight = computed(() => $store.midiData[3].value)
const computedButton = computed(() => $store.midiData[60].value)

tryOnMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'm') {
      document.querySelector('.midi')?.classList.toggle('is-visible')
    }
  })
})
</script>

<style lang="scss" scoped>
.midi {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;

  &:not(.is-visible) {
    display: none;
  }

  > div {
    position: relative;
    width: 240px;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000000ee;
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    border-radius: 12px;
    border: 1px solid #fff;
    font-size: 72px;

    &:nth-child(1) {
      background-color: #330000ee;
    }

    &:nth-child(2),
    &:nth-child(3) {
      background-color: #000044ee;
    }

    &:nth-child(5) {
      background-color: #ff0000;
    }

    &.is-connected {
      background-color: #00ff00;
    }

    &::before {
      content: attr(data-id);
      position: absolute;
      font-size: 12px;
      font-family: monospace;
      top: 0;
      left: 0;
      width: 100%;
      text-align: center;
      padding: 8px 0;
      text-transform: uppercase;
    }
  }
}
</style>
