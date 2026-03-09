<template>
  <div class="app">
    <Header />
    <transition mode="out-in" name="quick-fade">
      <Start v-if="$store.appState === APP_STATE.START" :callback="onStart" :qr-code="false" />
      <OnBoarding v-else-if="$store.appState === APP_STATE.ONBOARDING" />
      <Mixing v-else-if="$store.appState === APP_STATE.MIXING" :callback="onMixing" />
      <QrCode v-else-if="$store.appState === APP_STATE.QR_CODE" />
    </transition>
    <!--
    <Start v-if="storeVisible" :callback="onStart" :qr-code="false" />
    -->

    <IpadController v-if="$store.isIpad" />
    <JogwheelFx />
  </div>
</template>
a
<script setup lang="ts">
import { useAppStore } from '@renderer/store'
import Header from './blocks/header.vue'
import Start from './blocks/start.vue'
import QrCode from './blocks/qr-code.vue'
import OnBoarding from './blocks/onBoarding.vue'
import Mixing from './blocks/mixing.vue'
import IpadController from './blocks/ipad-controller.vue'
import JogwheelFx from './blocks/jogwheel-fx.vue'
import { APP_STATE } from '@renderer/libs/@global/const'

const $store = useAppStore()
// const storeVisible = ref(false)

const onStart = (): void => {
  $store.appState = APP_STATE.ONBOARDING
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

  /*
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background: radial-gradient(circle at 50% 50%, #faf3e9 50%, var(--blue) 100%);
    opacity: 0.25;
    z-index: -1;
  }
  */
}
</style>
