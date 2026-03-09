import { APP_STATE } from '@renderer/libs/@global/const'
import { defineStore } from 'pinia'
import { Pane } from 'tweakpane'

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

export const useAppStore = defineStore('app', {
  state: () => ({
    electron: typeof window !== 'undefined' && !!window.process?.versions?.electron,
    appState: APP_STATE.START,
    pinState: { x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0 },
    isIpad: getQueryParam('ipad') === '1',
    midiFound: false,
    scale: 1.24,
    tweakpane: getQueryParam('debug') === '1' ? new Pane() : null,
    midiData: {
      1: { name: 'FADER', input: 0, value: 0, x: 0, y: 0, velocity: 0 },
      2: { name: 'WHEEL_L', input: 0, value: 0, x: 0, y: 0, velocity: 0 },
      3: { name: 'WHEEL_R', input: 0, value: 0, x: 0, y: 0, velocity: 0 },
      60: { name: 'SWITCH', input: 0, value: 0, x: 0, y: 0, velocity: 0 }
    } as MidiData
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
    }
  }
})
