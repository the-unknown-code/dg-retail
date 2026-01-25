import { WebGLRenderer } from 'three'
import { M0Store } from './index'
import { EffectComposer } from 'postprocessing'
import M0SceneManager from '../view/SceneManager'

export default class M0Renderer {
  static instance: M0Renderer

  #store: M0Store
  #manager: M0SceneManager

  #r: WebGLRenderer
  #c: EffectComposer

  static getInstance(): M0Renderer {
    if (!M0Renderer.instance) {
      M0Renderer.instance = new M0Renderer()
    }
    return M0Renderer.instance
  }

  constructor() {
    this.#store = M0Store.getInstance()
    this.#manager = M0SceneManager.getInstance()

    this.#r = new WebGLRenderer()
    this.#r.setPixelRatio(this.#store.dpr)

    this.#c = new EffectComposer(this.#r)
  }

  resize(width: number, height: number): void {
    this.#r.setSize(width, height)
    this.#c.setSize(width, height)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(_time: number, _dt: number): void {
    const { instance } = this.#manager.activeScene
    if (!instance) return

    this.#r.render(instance.scene, instance.camera)
  }

  get r(): WebGLRenderer {
    return this.#r
  }

  get domElement(): HTMLCanvasElement {
    return this.#r.domElement
  }
}
