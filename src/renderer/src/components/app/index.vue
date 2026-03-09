<template>
  <div class="app">
    <transition mode="out-in" name="quick-fade">
      <Start v-if="$store.appState === APP_STATE.START" :callback="onStart" :qr-code="false" />
      <OnBoarding v-else-if="$store.appState === APP_STATE.ONBOARDING" />
      <Mixing v-else-if="$store.appState === APP_STATE.MIXING" :callback="onMixing" />
      <QrCode v-else-if="$store.appState === APP_STATE.QR_CODE" />
    </transition>

    <IpadController v-if="$store.isIpad" />
    <JogwheelFx v-if="$store.appState === APP_STATE.MIXING" />
    <Header />
    <audio ref="$audio" src="/sounds/env.mp3" playsinline autoplay loop />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '@renderer/store'
import Header from './blocks/header.vue'
import Start from './blocks/start.vue'
import QrCode from './blocks/qr-code.vue'
import OnBoarding from './blocks/onBoarding.vue'
import Mixing from './blocks/mixing.vue'
import IpadController from './blocks/ipad-controller.vue'
import JogwheelFx from './blocks/jogwheel-fx.vue'

import { APP_STATE } from '@renderer/libs/@global/const'
import { tryOnMounted } from '@vueuse/core'
import gsap from 'gsap/all'

const $audio = ref<HTMLAudioElement>()
const $store = useAppStore()
// const storeVisible = ref(false)

const onStart = (): void => {
  $store.appState = APP_STATE.ONBOARDING
}

const onMixing = (): void => {
  $store.appState = APP_STATE.QR_CODE
}

const fadeAudio = (volume: number = 0): void => {
  if (!$audio.value) return

  const value = { volume: $audio.value?.volume }
  gsap.to(value, {
    volume,
    duration: 1,
    ease: 'power2.out',
    onUpdate: () => {
      $audio.value!.volume = value.volume
    }
  })
}

watch(
  () => $store.appState,
  (value) => {
    if (value === APP_STATE.MIXING) {
      fadeAudio(0)
    } else {
      fadeAudio(1)
    }
  }
)

const onPlayAudio = (): void => {
  $audio.value?.play()
  window.removeEventListener('click', onPlayAudio)
}

tryOnMounted(() => {
  window.addEventListener('click', onPlayAudio)
})
</script>

<style lang="scss" scoped>
.app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}
</style>
