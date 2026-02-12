import {
  FloatType,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  WebGLRenderTarget
} from 'three'

import vertexShader from '../../../shaders/simulation/vertex.glsl?raw'
import dropFragmentShader from '../../../shaders/simulation/drop_fragment.glsl?raw'
import normalFragmentShader from '../../../shaders/simulation/normal_fragment.glsl?raw'
import updateFragmentShader from '../../../shaders/simulation/update_fragment.glsl?raw'
import { M0Renderer } from '@renderer/libs/@gl/core'

export default class WaterSimulation {
  _camera: OrthographicCamera
  _geometry: PlaneGeometry

  _rtA: WebGLRenderTarget
  _rtB: WebGLRenderTarget

  _rt: WebGLRenderTarget

  _dropShader: ShaderMaterial
  _normalShader: ShaderMaterial
  _updateShader: ShaderMaterial

  _dropMesh: Mesh
  _normalMesh: Mesh
  _updateMesh: Mesh

  #renderer: M0Renderer

  constructor(renderer: M0Renderer) {
    this.#renderer = renderer

    this._camera = new OrthographicCamera(0, 1, 1, 0, 0, 2000)
    this._geometry = new PlaneGeometry(2, 2)
    this._rtA = new WebGLRenderTarget(256, 256, { type: FloatType })
    this._rtB = new WebGLRenderTarget(256, 256, { type: FloatType })

    this._rt = this._rtA

    this._dropShader = new ShaderMaterial({
      uniforms: {
        center: { value: [0, 0] },
        radius: { value: 0 },
        strength: { value: 0 },
        tDiffuse: { value: null }
      },
      vertexShader,
      fragmentShader: dropFragmentShader
    })

    this._normalShader = new ShaderMaterial({
      uniforms: {
        delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
        tDiffuse: { value: null }
      },
      vertexShader,
      fragmentShader: normalFragmentShader
    })

    this._updateShader = new ShaderMaterial({
      uniforms: {
        delta: { value: [1 / 512, 1 / 512] }, // TODO: Remove this useless uniform and hardcode it in shaders?
        tDiffuse: { value: null }
      },
      vertexShader,
      fragmentShader: updateFragmentShader
    })

    this._dropMesh = new Mesh(this._geometry, this._dropShader)
    this._normalMesh = new Mesh(this._geometry, this._normalShader)
    this._updateMesh = new Mesh(this._geometry, this._updateShader)
  }

  // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
  addDrop(x: number, y: number, radius: number, strength: number): void {
    this._dropShader.uniforms.center.value = [x, y]
    this._dropShader.uniforms.radius.value = radius
    this._dropShader.uniforms.strength.value = strength

    this.compile(this._dropMesh)
  }

  stepSimulation(): void {
    this.compile(this._updateMesh)
  }

  updateNormals(): void {
    this.compile(this._normalMesh)
  }

  compile(_mesh: Mesh): void {
    const oldRT: WebGLRenderTarget = this._rt
    const newRT: WebGLRenderTarget = this._rt === this._rtA ? this._rtB : this._rtA

    if (_mesh.material instanceof ShaderMaterial) {
      _mesh.material.uniforms!.tDiffuse.value = oldRT.texture
    }

    this.#renderer.r.setRenderTarget(newRT)
    this.#renderer.r.render(_mesh, this._camera)
    this._rt = newRT
  }

  get texture(): Texture {
    return this._rt.texture as Texture
  }
}
