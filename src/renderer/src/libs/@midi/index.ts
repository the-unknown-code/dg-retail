/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAppStore } from '@renderer/store'

const DEVICE_NAME = 'D&G MACHINEZERO MIDI 1.1'
const MANUFACTURER = 'MACHINEZERO'

const STATUS = {
  CC: 176,
  NOTE_ON: 144,
  NOTE_OFF: 128
}

export default class Midi {
  #midiInput: MIDIInput | undefined
  #midiOutput: MIDIOutput | undefined
  #store: ReturnType<typeof useAppStore>

  constructor() {
    this.#store = useAppStore()
    navigator.requestMIDIAccess().then(this.#onMidiReady.bind(this))
  }

  #onMidiReady(midi: MIDIAccess): void {
    for (const input of midi.inputs.values()) {
      if (input.name === DEVICE_NAME && input.manufacturer === MANUFACTURER) {
        this.#midiInput = input
        this.#midiInput.onmidimessage = this.#onMessage.bind(this)
        this.#store.midiFound = true
        console.log('MIDI input connected:', input.name)
      }
    }

    for (const output of midi.outputs.values()) {
      if (output.name === DEVICE_NAME && output.manufacturer === MANUFACTURER) {
        this.#midiOutput = output
        console.log('MIDI output connected:', output.name)
      }
    }
  }

  //@ts-expect-error TODO: fix this
  // eslint-disable-next-line no-unused-private-class-members
  #sendCC(id: number, value: number): void {
    this.#midiOutput?.send([STATUS.CC, id, value])
  }

  #onMessage(e: MIDIMessageEvent): void {
    //@ts-expect-error TODO: fix this
    const [status, id, value] = e.data

    if (status === STATUS.CC) {
      this.#store.updateChannel(id, value)
    }

    if (status === STATUS.NOTE_ON && id === 60) {
      this.#store.updateChannel(id, 127)
    }

    if (status === STATUS.NOTE_OFF && id === 60) {
      this.#store.updateChannel(id, 0)
    }
  }
}
