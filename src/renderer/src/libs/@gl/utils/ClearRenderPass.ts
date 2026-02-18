import { RenderPass } from 'postprocessing'
import type { Scene, Camera, WebGLRenderer, WebGLRenderTarget } from 'three'

export default class ClearRenderPass extends RenderPass {
  private clearColor: number
  private clearAlpha: number

  constructor(scene: Scene, camera: Camera, color = 0xffffff, alpha = 1) {
    super(scene, camera)
    this.clearColor = color
    this.clearAlpha = alpha
  }

  override render(
    renderer: WebGLRenderer,
    inputBuffer: unknown,
    outputBuffer: unknown,
    deltaTime: number,
    stencilTest: boolean
  ): void {
    renderer.setClearColor(this.clearColor, this.clearAlpha)
    renderer.clear()

    super.render(
      renderer,
      inputBuffer as WebGLRenderTarget,
      outputBuffer as WebGLRenderTarget,
      deltaTime,
      stencilTest
    )
  }
}
