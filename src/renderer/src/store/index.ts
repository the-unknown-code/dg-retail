import { CornerZone } from '@renderer/components/app/controller/sound.vue'
import { APP_STATE } from '@renderer/libs/@global/const'
import { defineStore } from 'pinia'
import { Pane } from 'tweakpane'
import { LOCALES } from './locale'

export type MidiChannelId = 1 | 2 | 3 | 60

export interface MidiChannel {
  name: 'FADER' | 'WHEEL_L' | 'WHEEL_R' | 'SWITCH'
  input: number
  value: number
  x: number
  y: number
  velocity: number
}

export type MidiData = Record<MidiChannelId, MidiChannel>

export function getQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

const isBuildIpad = true
const isMobile = true

export const useAppStore = defineStore('app', {
  state: () => ({
    isGame: getQueryParam('mood') === null,
    config: {
      startingLanguage: 'fr',
      machineId: '',
      playDuration: 40,
      qrDuration: 15
    } as { startingLanguage: string; machineId: string; playDuration: number; qrDuration: number },
    electron: typeof window !== 'undefined' && !!window.process?.versions?.electron,
    appState: getQueryParam('debug') === '1' ? APP_STATE.MIXING : APP_STATE.START,
    debug: getQueryParam('debug') === '1',
    pinState: { x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0 },
    particleState: { x: 0, y: 0, rotation: 0 },
    isActive: false,
    isElectron: false,
    currentCorner: null as CornerZone | null,
    isMobile: getQueryParam('mobile') === '1' || isMobile,
    isIpad: getQueryParam('ipad') === '1' || isBuildIpad,
    isJogwheel: false,
    midiFound: false,
    scale: 1.25,
    corners: {
      TL: 0,
      TR: 0,
      BL: 0,
      BR: 0
    } as { TL: number; TR: number; BL: number; BR: number },
    playDuration: getQueryParam('debug') === '1' ? 300 : isMobile ? 25 : 40,
    qrDuration: getQueryParam('debug') === '1' ? 15 : 15,
    tweakpane: getQueryParam('debug') === '1' ? new Pane() : null,
    midiData: {
      1: { name: 'FADER', input: 0, value: 0, x: 0, y: 0, velocity: 0 },
      2: { name: 'WHEEL_L', input: 0, value: 0, x: 0, y: 0, velocity: 0 },
      3: { name: 'WHEEL_R', input: 0, value: 0, x: 0, y: 0, velocity: 0 },
      60: { name: 'SWITCH', input: 0, value: 0, x: 0, y: 0, velocity: 0 }
    } as MidiData,
    sessionData: {
      language: 'en',
      machineId: '',
      startTime: '',
      endTime: '',
      mood: '',
      fader: 0
    }
  }),

  actions: {
    start() {
      this.appState = APP_STATE.ONBOARDING
    },
    updateValue(id: MidiChannelId, value: number) {
      if (this.midiData[id]) {
        this.midiData[id].input = value
      }
    },
    updateChannel(id: MidiChannelId, value: number, x: number, y: number, velocity: number) {
      if (this.midiData[id]) {
        this.midiData[id].value = value
        this.midiData[id].x = x
        this.midiData[id].y = y
        this.midiData[id].velocity = Math.abs(velocity)
      }
    },
    getLocale(label: string) {
      return LOCALES.find((locale) => locale.id === (this.sessionData.language || 'en'))
        ?.translations[label]
    }
  }
})
