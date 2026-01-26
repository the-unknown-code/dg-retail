import {
  BufferAttribute,
  BufferGeometry,
  FrontSide,
  Mesh,
  PerspectiveCamera,
  ShaderMaterial,
  Texture,
  Vector3
} from 'three'

import vertexShader from '../../../shaders/pool/vertex.glsl?raw'
import fragmentShader from '../../../shaders/pool/fragment.glsl?raw'
import { M0Renderer, M0Store } from '@renderer/libs/@gl/core'

const vertices = new Float32Array([
  -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, -1, -1, -1, 1,
  -1, -1, -1, -1, 1, 1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, 1, -1, -1, -1, -1, 1, -1, 1, -1,
  -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1
])
const indices = new Uint32Array([
  0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7, 12, 13, 14, 14, 13, 15, 16, 17, 18, 18, 17, 19, 20, 21, 22,
  22, 21, 23
])

export default class Pool {
  _geometry: BufferGeometry
  _shader: ShaderMaterial

  _mesh: Mesh
  _camera: PerspectiveCamera

  #store: M0Store
  #renderer: M0Renderer

  constructor(renderer: M0Renderer, light: Vector3, camera: PerspectiveCamera) {
    this._camera = camera
    this.#renderer = renderer
    this.#store = M0Store.getInstance()

    this._geometry = new BufferGeometry()
    this._geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    this._geometry.setIndex(new BufferAttribute(indices, 1))

    this._shader = new ShaderMaterial({
      uniforms: {
        light: { value: light },
        tiles: { value: this.#store.get('tiles') },
        water: { value: null },
        causticTex: { value: null }
      },
      side: FrontSide,
      vertexShader,
      fragmentShader
    })

    this._mesh = new Mesh(this._geometry, this._shader)
    this._mesh.visible = false
  }

  update(waterTexture: Texture, causticTexture: Texture): void {
    this._shader.uniforms.water.value = waterTexture
    this._shader.uniforms.causticTex.value = causticTexture

    this.#renderer.r.render(this._mesh, this._camera)
  }
}
