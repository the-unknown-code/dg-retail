import M0AbstractScene from './AbstractScene'
import SeaScene from './sea'

export default class M0SceneManager {
  static instance: M0SceneManager

  #scenes: M0AbstractScene[] = []
  #currentIndex: number = 0

  static getInstance(): M0SceneManager {
    if (!M0SceneManager.instance) {
      M0SceneManager.instance = new M0SceneManager()
    }
    return M0SceneManager.instance
  }

  initialize(): void {
    this.#scenes.push(new SeaScene())
  }

  resize(): void {
    this.#scenes.forEach((scene) => {
      scene.resize()
    })
  }

  render(time: number, dt: number): void {
    this.#scenes.forEach((scene) => {
      scene.render(time, dt)
    })
  }

  get activeScene(): { instance: M0AbstractScene } {
    return {
      instance: this.#scenes[this.#currentIndex]
    }
  }
}
