import { APP_STATE } from '@renderer/libs/@global/const'
import { defineStore } from 'pinia'

export type MidiChannelId = 1 | 2 | 3 | 60

export interface MidiChannel {
  name: 'FADER' | 'WHEEL_L' | 'WHEEL_R' | 'SWITCH'
  value: number
  x: number
  y: number
}

export type MidiData = Record<MidiChannelId, MidiChannel>

export const useAppStore = defineStore('app', {
  state: () => ({
    electron: typeof window !== 'undefined' && !!window.process?.versions?.electron,
    appState: APP_STATE.MIXING,
    midiFound: false,
    midiData: {
      1: { name: 'FADER', value: 0, x: 0, y: 0 },
      2: { name: 'WHEEL_L', value: 0, x: 0, y: 0 },
      3: { name: 'WHEEL_R', value: 0, x: 0, y: 0 },
      60: { name: 'SWITCH', value: 0, x: 0, y: 0 }
    } as MidiData
  }),

  actions: {
    start() {
      this.appState = APP_STATE.ONBOARDING
    },
    updateChannel(id: MidiChannelId, value: number, x: number, y: number) {
      if (this.midiData[id]) {
        this.midiData[id].value = value
        this.midiData[id].x = x
        this.midiData[id].y = y
      }
    }
  }
})
