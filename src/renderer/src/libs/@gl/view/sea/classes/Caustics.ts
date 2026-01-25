import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  UnsignedByteType,
  Vector3,
  WebGLRenderTarget
} from 'three'

import vertexShader from '../../../shaders/caustics/vertex.glsl?raw'
import fragmentShader from '../../../shaders/caustics/fragment.glsl?raw'
import { M0Renderer } from '@renderer/libs/@gl/core'

export default class Caustics {
  _camera: OrthographicCamera
  _geometry: PlaneGeometry

  _shader: ShaderMaterial
  _rt: WebGLRenderTarget

  _mesh: Mesh

  #renderer: M0Renderer

  constructor(renderer: M0Renderer, geometry: PlaneGeometry, light: Vector3) {
    this.#renderer = renderer

    this._camera = new OrthographicCamera(0, 1, 1, 0, 0, 2000)
    this._geometry = geometry

    this._rt = new WebGLRenderTarget(1024, 1024, { type: UnsignedByteType })

    this._shader = new ShaderMaterial({
      uniforms: {
        light: { value: light },
        water: { value: null }
      },
      vertexShader,
      fragmentShader
    })

    this._mesh = new Mesh(this._geometry, this._shader)
  }

  update(waterTexture: Texture): void {
    this._shader.uniforms.water.value = waterTexture

    this.#renderer.r.setRenderTarget(this._rt)
    this.#renderer.r.setClearColor(0x000000, 0)
    this.#renderer.r.clear()

    this.#renderer.r.render(this._mesh, this._camera)
  }

  get texture(): Texture {
    return this._rt.texture as Texture
  }
}
