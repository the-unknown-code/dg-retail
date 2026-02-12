<template>
  <main>
    <Three />
    <App />
    <MidiDebug />
    <ControllerUI :soundCallback="soundCallback" />
  </main>
</template>

<script setup lang="ts">
import { Howler } from 'howler'
import { ref, watch } from 'vue'
import Three from './components/three/index.vue'
import MidiDebug from './components/app/debug/midi.vue'
import ControllerUI from './components/app/controller/ui.vue'
import Midi from './libs/@midi'
import SoundManager from './libs/@howler'
import { useAppStore } from './store'
import { tryOnMounted } from '@vueuse/core'
import App from './components/app/index.vue'
import { APP_STATE } from './libs/@global/const'
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

const $store = useAppStore()

new Midi()
const sound = new SoundManager()
const quadrantValues = ref<{
  topLeft: number
  topRight: number
  bottomLeft: number
  bottomRight: number
}>({
  topLeft: 0,
  topRight: 0,
  bottomLeft: 0,
  bottomRight: 0
})

const soundCallback = (values: {
  topLeft: number
  topRight: number
  bottomLeft: number
  bottomRight: number
}): void => {
  quadrantValues.value.topLeft = values.topLeft
  quadrantValues.value.topRight = values.topRight
  quadrantValues.value.bottomLeft = values.bottomLeft
  quadrantValues.value.bottomRight = values.bottomRight
}

watch(
  () => [
    quadrantValues.value.topLeft,
    quadrantValues.value.topRight,
    quadrantValues.value.bottomLeft,
    quadrantValues.value.bottomRight
  ],
  (values) => {
    if ($store.appState !== APP_STATE.MIXING) return
    sound.update({
      topLeft: values[0],
      topRight: values[1],
      bottomLeft: values[2],
      bottomRight: values[3]
    })
  }
)

watch(
  () => $store.midiData[1].input,
  (value) => {
    if ($store.appState !== APP_STATE.MIXING) return
    sound.updateAmbience(1 - value / 127)
  }
)

watch(
  () => $store.midiData[1].value,
  (value) => {
    if ($store.appState !== APP_STATE.MIXING) return
    sound.updateAmbience(1 - value / 127)
  }
)

tryOnMounted(() => {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume()
  }
})
</script>

<style lang="scss" scoped>
main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
