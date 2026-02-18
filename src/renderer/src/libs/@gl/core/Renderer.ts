import {
  HalfFloatType,
  LinearFilter,
  NoToneMapping,
  RGBAFormat,
  SRGBColorSpace,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { M0Store, M0Viewport } from './index'

import M0SceneManager from '../view/SceneManager'
import { BlendFunction, EffectComposer, EffectPass, TextureEffect } from 'postprocessing'

export default class M0Renderer {
  static instance: M0Renderer

  #store: M0Store
  #manager: M0SceneManager
  #viewport: M0Viewport

  #r: WebGLRenderer
  #c!: EffectComposer

  #diffuseRT: WebGLRenderTarget

  static getInstance(): M0Renderer {
    if (!M0Renderer.instance) {
      M0Renderer.instance = new M0Renderer()
    }
    return M0Renderer.instance
  }

  constructor() {
    this.#viewport = M0Viewport.getInstance()
    this.#store = M0Store.getInstance()
    this.#manager = M0SceneManager.getInstance()

    this.#r = new WebGLRenderer({
      antialias: false,
      alpha: false
    })

    this.#r.autoClear = false
    this.#r.outputColorSpace = SRGBColorSpace
    this.#r.toneMapping = NoToneMapping
    this.#r.setPixelRatio(this.#store.dpr)

    this.#c = new EffectComposer(this.#r, {
      frameBufferType: HalfFloatType
    })
    this.#c.setSize(this.#viewport.width, this.#viewport.height)

    this.#diffuseRT = new WebGLRenderTarget(this.#viewport.width, this.#viewport.height, {
      format: RGBAFormat,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: true,
      stencilBuffer: false
    })

    this.#diffuseRT.texture.needsUpdate = true
    this.#diffuseRT.texture.colorSpace = SRGBColorSpace
  }

  addPostProcessing(): void {
    const { instance } = this.#manager.activeScene
    if (!instance) return

    this.#c.removeAllPasses()

    const textureEffect = new TextureEffect({
      texture: this.#diffuseRT.texture,
      blendFunction: BlendFunction.NORMAL
    })

    const effectPass = new EffectPass(instance.camera, textureEffect)
    effectPass.renderToScreen = true
    this.#c.addPass(effectPass)
  }

  resize(width: number, height: number): void {
    this.#r.setSize(width, height, false)
    this.#c.setSize(width, height)
    this.#diffuseRT.setSize(width, height)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(_time: number, _dt: number): void {
    const { instance } = this.#manager.activeScene
    if (!instance) return

    /*
    this.#r.setRenderTarget(this.#diffuseRT)
    this.#r.setClearColor(0xffffff, 1)
    this.#r.clear()
    this.#r.render(instance.scene, instance.camera)
    this.#r.setRenderTarget(null)
    */

    this.#r.render(instance.scene, instance.camera)
    //this.#c.render(_dt)
  }

  get r(): WebGLRenderer {
    return this.#r
  }

  get domElement(): HTMLCanvasElement {
    return this.#r.domElement
  }
}
