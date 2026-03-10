// import gsap from 'gsap/all'
import gsap from 'gsap/all'
import { Howl } from 'howler'
Howler.volume(0)

const SOUND_GRID = {
  1: { label: 'B3', color: '#ffb3f4', instance: null as Howl | null },
  2: { label: 'B3_75-25_B4', color: '#efc6fe', instance: null as Howl | null },
  3: { label: 'B3_25-75_B4', color: '#e2ceff', instance: null as Howl | null },
  4: { label: 'B4', color: '#c9daf8', instance: null as Howl | null },
  5: { label: 'B1_25-75_B3', color: '#fdcddd', instance: null as Howl | null },
  6: { label: 'B3-75_B1-25_B4-25', color: '#ffffff', instance: null as Howl | null },
  7: { label: 'B4-75_B2-25_B3-25', color: '#fffeff', instance: null as Howl | null },
  8: { label: 'B2_25-75_B4', color: '#c9ffff', instance: null as Howl | null },
  9: { label: 'B1_75-25_B3', color: '#fccdc7', instance: null as Howl | null },
  10: { label: 'B1-75_B2-25_B4-25', color: '#ffffff', instance: null as Howl | null },
  11: { label: 'B2-75_B1-25_B3-25', color: '#ffffff', instance: null as Howl | null },
  12: { label: 'B2_75-25_B4', color: '#c0ffd0', instance: null as Howl | null },
  13: { label: 'B1', color: '#f5c5c5', instance: null as Howl | null },
  14: { label: 'B1_75-25_B2', color: '#ffe6cd', instance: null as Howl | null },
  15: { label: 'B1_25-75_B2', color: '#fdffce', instance: null as Howl | null },
  16: { label: 'B2', color: '#b6d7a8', instance: null as Howl | null }
}

export const fadeVolume = (volume: number = 1): void => {
  const value = { volume: Howler.volume() }
  gsap.to(value, {
    duration: 1,
    ease: 'power2.inOut',
    volume,
    onUpdate: () => {
      Howler.volume(value.volume)
    }
  })
}

export default class SoundManager {
  private currentIndex: number | null = null
  private currentSeek: number = 0

  constructor() {
    for (const sound of Object.values(SOUND_GRID)) {
      sound.instance = new Howl({
        src: [`/sounds/${sound.label}.mp3`],
        preload: true,
        loop: true,
        autoplay: false,
        volume: 0
      })
    }

    // Howler.ctx.resume()
  }

  playSound(index: number): void {
    if (this.currentIndex === index) return // already playing, do nothing

    const next = SOUND_GRID[index]?.instance
    if (!next) return

    // Fade out and stop all other playing sounds
    Object.entries(SOUND_GRID).forEach(([i, sound]) => {
      if (Number(i) !== index && sound.instance) {
        const s = sound.instance
        if (s.playing()) {
          this.currentSeek = s.seek() as number
          s.fade(s.volume(), 0, 1500)
          s.once('fade', () => s.stop()) // stop after fade completes
        }
      }
    })

    // Start and fade in the new sound
    if (!next.playing()) {
      next.volume(0)
      next.play()
      next.fade(next.volume(), 1, 1500)

      if (this.currentSeek > 0) {
        next.seek(this.currentSeek)
      }
    }

    next.fade(next.volume(), 1, 500)

    this.currentIndex = index
  }
}
