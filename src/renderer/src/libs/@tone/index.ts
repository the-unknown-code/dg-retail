import * as Tone from 'tone'

const SOUND_GRID: Record<number, { label: string; color: string; player: Tone.Player | null }> = {
  1: { label: 'B3', color: '#ffb3f4', player: null },
  2: { label: 'B3_75-25_B4', color: '#efc6fe', player: null },
  3: { label: 'B3_25-75_B4', color: '#e2ceff', player: null },
  4: { label: 'B4', color: '#c9daf8', player: null },
  5: { label: 'B1_25-75_B3', color: '#fdcddd', player: null },
  6: { label: 'B3-75_B1-25_B4-25', color: '#ffffff', player: null },
  7: { label: 'B4-75_B2-25_B3-25', color: '#fffeff', player: null },
  8: { label: 'B2_25-75_B4', color: '#c9ffff', player: null },
  9: { label: 'B1_75-25_B3', color: '#fccdc7', player: null },
  10: { label: 'B1-75_B2-25_B4-25', color: '#ffffff', player: null },
  11: { label: 'B2-75_B1-25_B3-25', color: '#ffffff', player: null },
  12: { label: 'B2_75-25_B4', color: '#c0ffd0', player: null },
  13: { label: 'B1', color: '#f5c5c5', player: null },
  14: { label: 'B1_75-25_B2', color: '#ffe6cd', player: null },
  15: { label: 'B1_25-75_B2', color: '#fdffce', player: null },
  16: { label: 'B2', color: '#b6d7a8', player: null }
}

const SILENT_DB = -80
const FADE_OUT = 1.5
const FADE_IN = 1.5

const masterVolume = new Tone.Volume(0).toDestination()

// Low-pass filter — muffles sound by cutting high frequencies
const muffle = new Tone.Filter({
  type: 'lowpass',
  frequency: 20000, // start fully open
  rolloff: -24
}).connect(masterVolume)

// Reverb — adds night atmosphere / spatial depth
const reverb = new Tone.Reverb({
  decay: 4,
  preDelay: 0.1,
  wet: 0
}).connect(muffle) // chain: reverb → muffle → masterVolume → destination

export const fadeVolume = (volume: number = 1, rampTime: number = 1): void => {
  const db = volume <= 0 ? SILENT_DB : Tone.gainToDb(volume)
  masterVolume.volume.rampTo(db, rampTime)
}

// 0 = dry, 1 = full night reverb
export const setNightReverb = (value: number, rampTime: number = 1): void => {
  const clamped = Math.max(0, Math.min(1, value))
  reverb.wet.rampTo(clamped, rampTime)
}

// 0 = normal, 1 = fully muffled
export const setMuffle = (value: number, rampTime: number = 1): void => {
  const clamped = Math.max(0, Math.min(1, value))
  const freq = 20000 * Math.pow(300 / 20000, clamped)
  muffle.frequency.rampTo(freq, rampTime)
}

export default class SoundManager {
  private currentIndex: number | null = null
  private currentSeek: number = 0
  private loaded: Promise<void>

  constructor() {
    for (const sound of Object.values(SOUND_GRID)) {
      sound.player = new Tone.Player({
        url: `/sounds/${sound.label}.ogg`,
        loop: true,
        autostart: false
      }).connect(reverb) // players → reverb → muffle → masterVolume → destination
    }

    this.loaded = Tone.loaded()
  }

  async start(): Promise<void> {
    await Tone.start()
    await this.loaded
    console.log('SoundManager: all buffers loaded')
  }

  playSound(index: number): void {
    if (this.currentIndex === index) return

    const next = SOUND_GRID[index]?.player
    if (!next || !next.loaded) {
      console.warn(`playSound(${index}): buffer not ready`)
      return
    }

    const now = Tone.now()

    for (const [i, sound] of Object.entries(SOUND_GRID)) {
      if (Number(i) !== index && sound.player) {
        const p = sound.player
        if (p.state === 'started') {
          this.currentSeek =
            p.buffer.duration > 0
              ? (Tone.getContext().currentTime -
                  ((p as Tone.Player & { _startTime?: number })._startTime ?? 0)) %
                p.buffer.duration
              : 0

          p.volume.cancelScheduledValues(now)
          p.volume.setValueAtTime(p.volume.value, now)
          p.volume.linearRampToValueAtTime(SILENT_DB, now + FADE_OUT)
          p.stop(now + FADE_OUT)
        }
      }
    }

    next.volume.cancelScheduledValues(now)

    if (next.state !== 'started') {
      next.volume.setValueAtTime(SILENT_DB, now)
      next.volume.linearRampToValueAtTime(0, now + FADE_IN)
      next.start(now)

      if (this.currentSeek > 0) {
        next.seek(this.currentSeek, now)
      }
    } else {
      next.volume.setValueAtTime(next.volume.value, now)
      next.volume.linearRampToValueAtTime(0, now + FADE_IN)
    }

    this.currentIndex = index
  }
}
