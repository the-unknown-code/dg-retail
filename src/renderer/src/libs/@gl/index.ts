import Tempus, { TempusCallback } from 'tempus'
import { M0Renderer, M0Store, M0Viewport, M0Loader } from './core'
import M0SceneManager from './view/SceneManager'
import { MANIFEST } from './data/manifest'

export default class M0Application {
  #canRender: boolean = false

  #store: M0Store
  #loader: M0Loader
  #manager: M0SceneManager
  #viewport: M0Viewport
  #renderer: M0Renderer

  #renderFn: TempusCallback
  #rafCancelFn: (() => void) | undefined

  constructor() {
    this.#store = M0Store.getInstance()
    this.#loader = M0Loader.getInstance()
    this.#viewport = M0Viewport.getInstance()

    this.#manager = M0SceneManager.getInstance()
    this.#renderer = M0Renderer.getInstance()
    this.#renderFn = this.render.bind(this)

    this.initialize()
  }

  async initialize(): Promise<void> {
    await this.#loader.preload(MANIFEST)
    this.#manager.initialize()
    this.resize()
  }

  resize(): void {
    this.#manager.resize()
    this.#renderer.resize(this.#viewport.width, this.#viewport.height)
  }

  render(time: number, dt: number): void {
    this.#viewport.render(time, dt)
    this.#manager.render(time, dt)
    this.#renderer.render(time, dt)
  }

  start(): void {
    this.#canRender = true
    this.#rafCancelFn = Tempus.add(this.#renderFn, { priority: -1 })
    this.resize()
  }

  stop(): void {
    this.#canRender = false
    this.#rafCancelFn?.()
  }

  pause(): void {
    this.#canRender = false
  }

  resume(): void {
    this.#canRender = true
  }

  isStopped(): boolean {
    return !this.#canRender
  }

  get store(): M0Store {
    return this.#store
  }

  get renderer(): M0Renderer {
    return this.#renderer
  }
}
