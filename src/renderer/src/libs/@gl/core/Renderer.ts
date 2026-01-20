import { WebGLRenderer, WebGLRendererParameters } from 'three'

export default class M0Renderer {
  static instance: M0Renderer

  #r: WebGLRenderer

  static M0Renderer(
    options: Partial<WebGLRendererParameters>,
    canvas: HTMLCanvasElement
  ): M0Renderer {
    if (!M0Renderer.instance) {
      M0Renderer.instance = new M0Renderer(options, canvas)
    }
    return M0Renderer.instance
  }

  constructor(options: Partial<WebGLRendererParameters>, canvas: HTMLCanvasElement) {
    this.#r = new WebGLRenderer({ ...options, canvas })
  }

  resize(width: number, height: number): void {
    this.#r.setSize(width, height)
  }

  render(time: number, dt: number): void {
    console.log(time, dt)
  }
}
