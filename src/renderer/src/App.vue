<template>
  <transition name="quick-fade" mode="out-in">
    <template v-if="$store.isGame">
      <main v-if="isSoundStarted || isPreloaded" @click="handleStart">
        <Three>
          <App />
        </Three>

        <MidiDebug />
        <ControllerUI />
        <ControllerSound :sound-callback="soundCallback" />

        <div class="background" />
      </main>
    </template>
    <template v-else>
      <Landing />
    </template>
  </transition>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { tryOnMounted } from '@vueuse/core'
import Three from './components/three/index.vue'
import MidiDebug from './components/app/debug/midi.vue'
import ControllerUI from './components/app/controller/ui.vue'
import ControllerSound from './components/app/controller/sound.vue'
import Midi from './libs/@midi'
import SoundManager, { setMuffle, setNightReverb } from './libs/@tone'
import Landing from './components/app/blocks/landing.vue'
import App from './components/app/index.vue'
import { useAppStore } from './store'
import { APP_STATE } from './libs/@global/const'
import { getConfig } from './utils/machineId'
import { syncData } from './libs/@google/api'

const $store = useAppStore()
const isElectron = navigator.userAgent.toLowerCase().includes('electron')
$store.isElectron = isElectron

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
    $store.currentCorner = null
    if (value === APP_STATE.MIXING) {
      sound.playSound(currentGridIndex.value as number)
    }

    const now = new Date()
    const pad = (n: number): string => n.toString().padStart(2, '0')
    const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    if (value === APP_STATE.ONBOARDING) {
      $store.sessionData.startTime = formattedDate
    } else if (value === APP_STATE.QR_CODE) {
      $store.sessionData.endTime = formattedDate
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

function getQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

tryOnMounted(async () => {
  await nextTick()
  if ($store.isMobile) {
    document.documentElement.classList.add('is-mobile')
    const lang = getQueryParam('lang') ?? 'en'
    $store.sessionData.language = lang
  }

  if ($store.isIpad) {
    document.documentElement.classList.add('is-ipad')
  }

  if (isElectron) {
    const config: {
      machineId: string
      playDuration: number
      qrDuration: number
      startingLanguage: string
    } = (await getConfig()) as {
      machineId: string
      playDuration: number
      qrDuration: number
      startingLanguage: string
    }

    $store.config = config
    $store.sessionData.machineId = (config?.machineId as string) ?? ''
    $store.playDuration = config?.playDuration ?? 40
    $store.qrDuration = config?.qrDuration ?? 40
    document.documentElement.classList.add('electron')

    window.electron.ipcRenderer.invoke('init-machine', config.machineId)
    window.addEventListener('online', () => {
      window.electron.ipcRenderer.invoke('sync-data', config.machineId)
    })

    await sound.start()
    isSoundStarted.value = true
  } else if (!$store.isIpad) {
    await sound.preload()
    isPreloaded.value = true
    // isSoundStarted.value = true
  } else {
    const id = localStorage.getItem('id')

    if (!$store.isMobile && !id) {
      // Open a prompt dialog box to input an id
      const userId = window.prompt('Please enter your ID:', '')
      if (userId && typeof userId === 'string' && userId.trim().length > 0) {
        $store.sessionData.machineId = userId.trim()
        localStorage.setItem('id', userId.trim())
      }
    } else if (!$store.isMobile && id) {
      $store.sessionData.machineId = id as string
      syncData(id, [{ a: '1' }])
    }

    await sound.preload()
    isPreloaded.value = true
  }

  setTimeout(() => {
    document.documentElement.classList.add('loaded')
  }, 150)
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

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  pointer-events: none;
  z-index: 999;
  transition: opacity 1.5s ease;

  &:where(.loaded *) {
    opacity: 0;
  }
}
</style>
