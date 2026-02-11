import { APP_STATE } from '@renderer/libs/@global/const'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appState: APP_STATE.MIXING,
    midiFound: false,
    midiData: {
      1: { name: 'FADER', value: 0 },
      2: { name: 'WHEEL_L', value: 0 },
      3: { name: 'WHEEL_R', value: 0 },
      60: { name: 'SWITCH', value: 0 }
    }
  }),

  actions: {
    start() {
      this.appState = APP_STATE.ONBOARDING
    },
    updateChannel(id: number, value: number) {
      if (this.midiData[id]) {
        this.midiData[id].value = value
      }
    }
  }
})
