import { APP_STATE } from '@renderer/libs/@global/const'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    appState: APP_STATE.START
  }),

  actions: {
    start() {
      this.appState = APP_STATE.ONBOARDING
    }
  }
})
