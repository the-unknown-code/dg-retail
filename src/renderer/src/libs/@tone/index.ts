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
// const FADE_OUT = 1.5
// const FADE_IN = 1.5

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

const getSoundUrl = (label: string): string => {
  if (import.meta.env.PROD) {
    // Resolve relative to current page — works for file:// protocol
    return new URL(`sounds/${label}.mp3`, window.location.href).href
  }
  return `/sounds/${label}.mp3`
}

export default class SoundManager {
  private currentIndex: number | null = null
  // private currentSeek: number = 0
  private loaded: Promise<void>

  constructor() {
    for (const sound of Object.values(SOUND_GRID)) {
      sound.player = new Tone.Player({
        url: getSoundUrl(sound.label),
        loop: true,
        autostart: false
      }).connect(reverb) // players → reverb → muffle → masterVolume → destination
    }

    this.loaded = Tone.loaded()
  }

  async preload(): Promise<void> {
    return this.loaded.then(() => {
      console.log('SoundManager: all buffers preloaded')
    })
  }

  async mobileStart(): Promise<void> {
    // Must call Tone.start() synchronously in the gesture — no awaits before it

    await Tone.start()

    const ctx = Tone.getContext().rawContext as AudioContext

    // Resume if suspended, but don't loop forever
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    await this.loaded
    console.log('SoundManager ready, context state:', ctx.state)
  }

  async start(): Promise<void> {
    const ctx = Tone.getContext().rawContext as AudioContext

    try {
      while (ctx.state !== 'running') {
        await ctx.resume()
        await Tone.start()
        await new Promise((r) => setTimeout(r, 150))
      }
    } catch (e) {
      console.warn('AudioContext resume failed, retrying...', e)
      await new Promise((r) => setTimeout(r, 500))
      await ctx.resume()
    }

    await this.loaded
    console.log('SoundManager ready, context state:', ctx.state)
  }

  private playStartTime: number = 0
  private playStartSeek: number = 0 // the seek offset we started from

  getCurrentSeek(): number {
    if (this.currentIndex === null) return 0
    const p = SOUND_GRID[this.currentIndex]?.player
    if (!p || !p.loaded || p.state !== 'started' || p.buffer.duration === 0) return 0

    const elapsed = Tone.now() - this.playStartTime
    return (this.playStartSeek + elapsed) % p.buffer.duration
  }

  // Returns 0–1 progress through the current loop
  getCurrentProgress(): number {
    if (this.currentIndex === null) return 0
    const p = SOUND_GRID[this.currentIndex]?.player
    if (!p || !p.loaded || p.buffer.duration === 0) return 0

    return this.getCurrentSeek() / p.buffer.duration
  }

  playSound(index: number): void {
    const next = SOUND_GRID[index]?.player
    if (!next || !next.loaded) {
      console.warn(`playSound(${index}): buffer not ready`)
      return
    }

    if (this.currentIndex === index && next.state === 'started') return

    const now = Tone.now()

    // Capture progress ratio (0–1) from current track before stopping 👈
    const progress = this.getCurrentProgress()

    // Stop all other playing sounds
    for (const [i, sound] of Object.entries(SOUND_GRID)) {
      if (Number(i) !== index && sound.player) {
        const p = sound.player
        if (p.state === 'started') {
          p.volume.cancelScheduledValues(now)
          p.stop(now)
        }
      }
    }

    if (next.state === 'started') {
      next.stop(now)
    }

    //next.volume.cancelScheduledValues(now)
    //next.volume.setValueAtTime(0, now)

    const SEEK_OFFSET = 0.001
    next.start(now)

    // Map progress ratio onto the new buffer's duration 👈
    if (progress > 0 && next.buffer.duration > 0) {
      const seekPos = progress * next.buffer.duration
      next.seek(seekPos, now + SEEK_OFFSET) // 👈 schedule slightly after start
      this.playStartSeek = seekPos
    } else {
      this.playStartSeek = 0
    }

    this.playStartTime = now + SEEK_OFFSET

    this.playStartTime = now
    this.currentIndex = index
  }
}
