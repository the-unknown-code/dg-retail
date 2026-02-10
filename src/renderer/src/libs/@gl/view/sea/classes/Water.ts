import {
  BackSide,
  FrontSide,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  Vector3
} from 'three'

import vertexShader from '../../../shaders/water/vertex.glsl?raw'
import fragmentShader from '../../../shaders/water/fragment.glsl?raw'
import { M0Renderer, M0Store } from '@renderer/libs/@gl/core'

export default class Water {
  _geometry: PlaneGeometry
  _shader: ShaderMaterial

  _mesh: Mesh
  _camera: PerspectiveCamera

  #store: M0Store
  #renderer: M0Renderer

  constructor(renderer: M0Renderer, light: Vector3, camera: PerspectiveCamera) {
    this._camera = camera
    this.#renderer = renderer

    this.#store = M0Store.getInstance()

    this._geometry = new PlaneGeometry(2, 2, 1024, 1024)
    this._shader = new ShaderMaterial({
      uniforms: {
        light: { value: light },
        tiles: { value: this.#store.get('tile') },
        sky: { value: this.#store.get('env') },
        water: { value: null },
        elevationScale: { value: 1 },
        causticTex: { value: null },
        underwater: { value: false }
      },
      vertexShader,
      fragmentShader
    })

    this._mesh = new Mesh(this._geometry, this._shader)
  }

  update(waterTexture: Texture, causticTexture: Texture): void {
    this._shader.uniforms.water.value = waterTexture
    this._shader.uniforms.causticTex.value = causticTexture

    this._shader.side = FrontSide
    this._shader.uniforms.underwater.value = true
    this.#renderer.r.render(this._mesh, this._camera)

    this._shader.side = BackSide
    this._shader.uniforms.underwater.value = false
    this.#renderer.r.render(this._mesh, this._camera)
  }

  pixelsToWorld(px: number, cHeight: number): number {
    // window.innerHeight is the projection height for this camera
    return cHeight * (px / window.innerHeight)
  }

  resize(): void {
    const PADDING = 80
    const dist: number = this._camera.position.y

    // Calculate half-heights/widths in world units, then add padding in same units.
    const cHeight = 2 * dist * Math.tan(MathUtils.degToRad(this._camera.fov * 0.5))
    const cWidth = cHeight * this._camera.aspect

    // Convert 120px padding to world units.
    const paddingWorldH = this.pixelsToWorld(PADDING, cHeight)
    const paddingWorldW = paddingWorldH * this._camera.aspect

    this._mesh.scale.set((cWidth + paddingWorldW) / 2, 1, (cHeight + paddingWorldH) / 2)
  }

  get geometry(): PlaneGeometry {
    return this._geometry
  }
}
