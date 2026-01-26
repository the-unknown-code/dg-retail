import { M0Renderer } from '@renderer/libs/@gl/core'
import { Mesh, OrthographicCamera, PlaneGeometry, ShaderMaterial, Texture } from 'three'

import vertexShader from '../../../shaders/debug/vertex.glsl?raw'
import fragmentShader from '../../../shaders/debug/fragment.glsl?raw'

export default class Debug {
  _mesh: Mesh

  _camera: OrthographicCamera
  _geometry: PlaneGeometry

  _shader: ShaderMaterial
  #renderer: M0Renderer

  constructor(renderer: M0Renderer) {
    this.#renderer = renderer

    this._camera = new OrthographicCamera(0, 1, 1, 0, 0, 1)
    this._geometry = new PlaneGeometry()

    this._shader = new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null }
      },
      vertexShader,
      fragmentShader
    })

    this._mesh = new Mesh(this._geometry, this._shader)
  }

  update(texture: Texture): void {
    this._shader.uniforms.tDiffuse.value = texture

    this.#renderer.r.setRenderTarget(null)
    this.#renderer.r.render(this._mesh, this._camera)
  }
}
