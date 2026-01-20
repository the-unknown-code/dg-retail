import { PerspectiveCamera, Scene } from 'three'
import { M0Viewport } from '../core'

export default class M0AbstractScene {
  #scene: Scene
  #camera: PerspectiveCamera

  #viewport: M0Viewport

  constructor() {
    this.#viewport = M0Viewport.getInstance()

    this.#scene = new Scene()
    this.#camera = new PerspectiveCamera(17.1, 1, 0.1, 1000)
    this.#camera.position.z = 10
  }

  resize(): void {
    this.#camera.aspect = this.#viewport.width / this.#viewport.height
    this.#camera.updateProjectionMatrix()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(_time: number, _dt: number): void {
    /* empty */
  }

  get viewport(): M0Viewport {
    return this.#viewport
  }

  get scene(): Scene {
    return this.#scene
  }

  get camera(): PerspectiveCamera {
    return this.#camera
  }
}
