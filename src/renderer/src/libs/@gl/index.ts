import { WebGLRendererParameters } from 'three'
import M0Renderer from './core/Renderer'

export default class M0Application {
  #renderer: M0Renderer

  constructor(options: Partial<WebGLRendererParameters>, canvas: HTMLCanvasElement) {
    this.#renderer = new M0Renderer(options, canvas)
  }

  resize(width: number, height: number): void {
    this.#renderer.resize(width, height)
  }

  render(time: number, dt: number): void {
    this.#renderer.render(time, dt)
  }
}
