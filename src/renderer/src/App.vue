<template>
  <main v-if="isSoundStarted || isPreloaded" @click="handleStart">
    <Three>
      <App />
    </Three>

    <MidiDebug />
    <ControllerUI />
    <ControllerSound :sound-callback="soundCallback" />
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { tryOnMounted } from '@vueuse/core'
import Three from './components/three/index.vue'
import MidiDebug from './components/app/debug/midi.vue'
import ControllerUI from './components/app/controller/ui.vue'
import ControllerSound from './components/app/controller/sound.vue'
import Midi from './libs/@midi'
import SoundManager, { setMuffle, setNightReverb } from './libs/@tone'
import App from './components/app/index.vue'
import { useAppStore } from './store'
import { APP_STATE } from './libs/@global/const'

const $store = useAppStore()
const isElectron = navigator.userAgent.toLowerCase().includes('electron')

const isSoundStarted = ref(false)
const isPreloaded = ref(false)
const currentGridIndex = ref<number | null>(null)

new Midi()
const sound = new SoundManager()

const soundCallback = (index: number | null): void => {
  currentGridIndex.value = index
  if ($store.appState !== APP_STATE.MIXING) return
  if (!isSoundStarted.value) return
  sound.playSound(index as number)
}

const handleStart = async (): Promise<void> => {
  if (isSoundStarted.value) return
  await sound.start()
  isSoundStarted.value = true
}

watch(
  () => $store.appState,
  (value) => {
    if (value === APP_STATE.MIXING) {
      sound.playSound(currentGridIndex.value as number)
    }
  }
)

watch(
  () => $store.midiData[1].value,
  (value) => {
    if (value) {
      const reverb = value / 127
      setMuffle(reverb / 1.5, 1)
      setNightReverb(reverb / 1.5, 1)
    }
  }
)

tryOnMounted(async () => {
  if (isElectron) {
    await sound.start()
    isSoundStarted.value = true
  } else if (!$store.isIpad) {
    await sound.preload()
    isPreloaded.value = true
    // isSoundStarted.value = true
  } else {
    await sound.preload()
    isPreloaded.value = true
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
  overflow: hidden;
}

.start-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  z-index: 9999;

  span {
    color: white;
    font-size: 1.5rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.75;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
