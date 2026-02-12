<template>
  <div class="app">
    <Header />
    <transition mode="out-in" name="quick-fade">
      <Start
        v-if="$store.appState === APP_STATE.START || $store.appState === APP_STATE.QR_CODE"
        :callback="onStart"
        :qr-code="$store.appState === APP_STATE.QR_CODE"
      />
      <OnBoarding v-else-if="$store.appState === APP_STATE.ONBOARDING" />
      <Mixing v-else-if="$store.appState === APP_STATE.MIXING" :callback="onMixing" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@renderer/store'
import Header from './blocks/header.vue'
import Start from './blocks/start.vue'
import OnBoarding from './blocks/onBoarding.vue'
import Mixing from './blocks/mixing.vue'
import { APP_STATE } from '@renderer/libs/@global/const'

const $store = useAppStore()

const onStart = (): void => {
  $store.start()
  setTimeout(() => {
    $store.appState = APP_STATE.MIXING
  }, 5000)
}

const onMixing = (): void => {
  $store.appState = APP_STATE.QR_CODE
}
</script>

<style lang="scss" scoped>
.app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  padding: var(--app-padding);
  display: flex;
  flex-direction: column;
  gap: 32px;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background: radial-gradient(circle at 50% 50%, #faf3e9 50%, var(--blue) 100%);
    opacity: 0.5;
    z-index: -1;
  }
}
</style>
