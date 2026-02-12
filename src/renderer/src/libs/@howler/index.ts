import gsap from 'gsap/all'
import { Howl, Howler } from 'howler'
Howler.volume(1)

import a1 from '/sounds/a1.mp3'
import a2 from '/sounds/a2.mp3'
import a3 from '/sounds/a3.mp3'
import a4 from '/sounds/a4.mp3'
import ambienceSound from '/sounds/ambience.mp3'

const SOUNDS = [
  {
    id: 'topLeft',
    src: a1,
    instance: null as Howl | null
  },
  {
    id: 'topRight',
    src: a2,
    instance: null as Howl | null
  },
  {
    id: 'bottomLeft',
    src: a3,
    instance: null as Howl | null
  },
  {
    id: 'bottomRight',
    src: a4,
    instance: null as Howl | null
  }
]

let ambience = null as Howl | null
export default class SoundManager {
  constructor() {
    for (const sound of SOUNDS) {
      sound.instance = new Howl({
        src: [sound.src],
        preload: true,
        loop: true,
        autoplay: true,
        volume: 0
      })

      sound.instance.play()
    }

    ambience = new Howl({
      src: [ambienceSound],
      preload: true,
      loop: true,
      autoplay: true,
      volume: 0.5
    })

    ambience.play()
    Howler.ctx.resume()
  }

  update(values: {
    topLeft: number
    topRight: number
    bottomLeft: number
    bottomRight: number
  }): void {
    for (const sound of SOUNDS) {
      const volume = gsap.utils.mapRange(0.25, 1, 0.05, 0.35, values[sound.id])
      sound.instance?.volume(volume)
    }
  }

  updateAmbience(volume: number): void {
    if (!ambience) return
    ambience.volume(volume)
  }
}
