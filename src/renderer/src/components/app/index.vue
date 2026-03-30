<template>
  <div :class="['app', { 'is-mobile': $store.isMobile }]">
    <div ref="$background" class="app__background" />
    <transition mode="out-in" name="quick-fade">
      <null v-if="$store.appState === APP_STATE.NULL" />
      <start v-else-if="$store.appState === APP_STATE.START" :callback="onStart" :qr-code="false" />
      <on-boarding v-else-if="$store.appState === APP_STATE.ONBOARDING" />
      <div v-else-if="$store.appState === APP_STATE.MIXING" class="full mixing">
        <mixing :callback="onMixing" />
      </div>
      <div v-else-if="$store.appState === APP_STATE.QR_CODE" class="full">
        <qr-code />
      </div>
    </transition>

    <transition mode="out-in" name="quick-fade">
      <div v-if="$store.appState === APP_STATE.MIXING" class="full controller">
        <IpadController v-if="$store.isIpad && !$store.isMobile" />
        <MobileController v-if="$store.isMobile && $store.isIpad" />
      </div>
    </transition>

    <JogwheelFx v-if="$store.appState === APP_STATE.MIXING" />
    <Header />
  </div>
</template>

<script setup lang="ts">
import * as Tone from 'tone'
import { ref, watch } from 'vue'
import { useAppStore } from '@renderer/store'
import Header from './blocks/header.vue'
import Null from './blocks/null.vue'
import Start from './blocks/start.vue'
import QrCode from './blocks/qr-code.vue'
import OnBoarding from './blocks/onBoarding.vue'
import Mixing from './blocks/mixing.vue'
import IpadController from './blocks/ipad-controller.vue'
import MobileController from './blocks/mobile-controller.vue'
import JogwheelFx from './blocks/jogwheel-fx.vue'

import { APP_STATE } from '@renderer/libs/@global/const'
import { tryOnMounted } from '@vueuse/core'
import gsap from 'gsap/all'

const $audio = ref<HTMLAudioElement>()
const $store = useAppStore()
const $background = ref<HTMLDivElement>()
// const storeVisible = ref(false)

const getSoundUrl = (label: string): string => {
  if (import.meta.env.PROD) {
    // Resolve relative to current page — works for file:// protocol
    return new URL(`sounds/${label}.mp3`, window.location.href).href
  }
  return `/sounds/${label}.mp3`
}

const ambientPlayer = new Tone.Player({
  url: getSoundUrl('env'),
  loop: true,
  autostart: false
}).toDestination()

const onStart = (): void => {
  $store.appState = APP_STATE.ONBOARDING
}

const onMixing = (): void => {
  $store.appState = APP_STATE.QR_CODE
}

const fadeAudio = (volume: number = 0): void => {
  const db = volume <= 0 ? -80 : Tone.gainToDb(volume)
  ambientPlayer.volume.rampTo(db, 1)
}

watch(
  () => $store.appState,
  (value) => {
    if (value === APP_STATE.QR_CODE) {
      // Set 3 query parameters in the current URL
      const url = new URL(window.location.href)
      url.searchParams.set('lang', $store.sessionData.language || 'en')
      url.searchParams.set('mood', $store.sessionData.mood)
      url.searchParams.set('fader', $store.midiData[1].value.toString() || '0')
      window.history.replaceState({}, '', url.toString())

      $store.isGame = false
    }

    if (value === APP_STATE.MIXING) {
      setTimeout(() => {
        if (!$background.value) return
        gsap.to($background.value, {
          opacity: 0,
          duration: 1.5,
          ease: 'power2.inOut'
        })
      }, 1850)

      fadeAudio(0)
    } else {
      fadeAudio(1)
    }
  },
  { immediate: true }
)

const onPlayAudio = (): void => {
  $audio.value?.play()
  window.removeEventListener('click', onPlayAudio)
}

const playAmbientAudio = (): void => {
  Tone.loaded().then(() => {
    ambientPlayer.start()
  })
}

tryOnMounted(async () => {
  await Tone.start()
  playAmbientAudio()
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

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, var(--blue) 0%, black 200%);
    opacity: 0.5;
    pointer-events: none;
  }
}

.full {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;

  &.controller {
    z-index: 5000;
  }

  &.mixing {
    z-index: 2000;
  }
}
</style>
