import { CornerZone } from '@renderer/components/app/controller/sound.vue'
import { APP_STATE } from '@renderer/libs/@global/const'
import { defineStore } from 'pinia'
import { Pane } from 'tweakpane'
import { LOCALES } from './locale'

const CLIENT_EMAIL = 'dg-retail@unknown-388102.iam.gserviceaccount.com'
const PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4KfEneP5+SKH0\nzygHNkOInP38OaQjGaVusY0ydPZNTA59NfT4/gMe9HzALFppyAWm915gmll2rRnB\nGycCR+92CrgPSU5TTeM7A+RX+RJx7dqRQgFWgYgcRWO1stBCtefWHZkfdT9pZ4by\nrtemG+LhrnNUSwCBu+pQx1jqoLS88jxG6lRAtV02AgJc+oWA3M/OSgGPB1B11UtB\n1QpcmqmEdkPUZd5RpmB+yV4VbFlbCIcgIrb4+Z5xS68cU+Q0bu7HIC/cSU22QmEl\n7QM7syEFW+n9AKJ7czeHH4HLpNay4XOOurgw7C6pAXU2GYQDV/aaQ7tRGOab4gJ2\n5PljGE0NAgMBAAECggEAScF9cPPe/31q1S20geA41iOCwTIIfH4k0u9mPbbRdUvD\niqc8tbwZBVw4r4z/Gi1esK8Yl7GIIWN1IhWF1IG4w+aPqctpwgyGGoYfmZ3nQ4Ej\n0sRBTYqV/4EID3qjtxAFZXfKiLT6McOZMguRAEeNePG2STk5X1WQYI2++Yzl6rmm\nJ3bJqZMlMTOCXi5siTDlzz/LGNvnqnJAhR5qIdtPQQ+KJG7PyAVakxm9QE/DusDb\nbxFwRrGmYL86cRSqfPY535ikckIv/bOtdZJ2RIKhOJCcS9VcR2UuYvEOGvSMcNir\n5hdUU9ywwrf0lfzUGCjWfkyHVvR0so0LNigFVoBG6QKBgQD+n23qSB+sKjm5oH9l\npwJXFuPbGOHREjjpd67RKJ3G8RBjGCI9MitYqSpHZf3tmuB9GRwlHe+C0iqwQmHe\ngnYGKRX9SIuY+ntGSpKqOzf5F/UrBoqbtjREXptXVeT+xuJoaNPSDatLPqyP8EIk\nH6KtyYXectr9FUhjLPiwLqgPTwKBgQD5gZGw3Bs2+A7/0qE0GKiDzqQg0+VM1h0y\ngmBF3pDBgMbpBBCvJhb6Xrm2NvmoXAZqtWVdrRDtnaLBEzVLQMZtrgPV9Z88tnjq\nNhEyFfHrgZq6fP9lXTZ2WbRwidmBr2sl+eIH0h8MzCH2XAjRTQYvMqTRIAMkIWby\nIG1o5iMm4wKBgEAODZG9uTIPoVwAc2w4Oo98M7A/rzdwdR7OvAzkQeT1aiDzxlFM\n2LjCPd+eWeY3azgtY/Y2dLWdd53F5WcbvONJ3L1OTcgbY33IbuMiaK9ihovfZmlL\nyhRVFJFBC43IrNaFYJxcUfZo+vJvB8ScrMk5hFL05AB9JSvF+X4hDqhjAoGBALCL\nAa+GzqricpqJSw81s2cwO+oOhN0NU7N9lOlbRknk+Nm/yp5j8TZO+FD6LUT3eILg\nv0y9PJElTRgYo0kQGFdbHdOy7G1lH8F5aElsRbVCC12RPJVYk0TCzG4k3AZrPQGu\nAkVOZDIF7rIHBSYzvgB/cSeX4yEZkWIZl9D1pkHJAoGAF/c84Mv7maKeSGGWI2rH\nI2iMBVetXYZuhzG3IUUdktkTWmdnQ3IpkIIwf/h/c8Byc/VmoSFw2QRZckdiN3ot\nWbAvkOI55vpkkykc8w8Es65Zp/8gKMm5zXTPdbYZmtrJoTYC8vd7aWYwUmx+xjJR\ns+tC6POWssvg0L/iVypmQtg=\n-----END PRIVATE KEY-----\n'

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
    config: {
      startingLanguage: 'fr',
      machineId: '',
      playDuration: 40,
      qrDuration: 15
    } as { startingLanguage: string; machineId: string; playDuration: number; qrDuration: number },
    electron: typeof window !== 'undefined' && !!window.process?.versions?.electron,
    appState: getQueryParam('debug') === '1' ? APP_STATE.MIXING : APP_STATE.START,
    debug: getQueryParam('debug') === '1',
    googleAuth: {
      clientEmail: CLIENT_EMAIL,
      privateKey: PRIVATE_KEY
    },
    pinState: { x: 0, y: 0, vx: 0, vy: 0, nx: 0, ny: 0 },
    particleState: { x: 0, y: 0, rotation: 0 },
    isActive: false,
    isElectron: false,
    currentCorner: null as CornerZone | null,
    isIpad: getQueryParam('ipad') === '1',
    isJogwheel: false,
    midiFound: false,
    scale: 1.25,
    corners: {
      TL: 0,
      TR: 0,
      BL: 0,
      BR: 0
    } as { TL: number; TR: number; BL: number; BR: number },
    playDuration: getQueryParam('debug') === '1' ? 200 : 20,
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
      return LOCALES.find((locale) => locale.id === this.sessionData.language)?.translations[label]
    }
  }
})
