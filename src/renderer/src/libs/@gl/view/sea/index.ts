import {
  FloatType,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  WebGLRenderTarget
} from 'three'
import M0AbstractScene from '../AbstractScene'

import vertexShader from '../../shaders/simulation/vertex.glsl?raw'
import dropFragmentShader from '../../shaders/simulation/drop_fragment.glsl?raw'
import normalFragmentShader from '../../shaders/simulation/normal_fragment.glsl?raw'
import updateFragmentShader from '../../shaders/simulation/update_fragment.glsl?raw'

export default class SeaScene extends M0AbstractScene {
  _camera: OrthographicCamera
  _geometry: PlaneGeometry

  _rtA: WebGLRenderTarget
  _rtB: WebGLRenderTarget

  _texture: WebGLRenderTarget

  _dropShader: RawShaderMaterial
  _normalShader: RawShaderMaterial
  _updateShader: RawShaderMaterial

  _dropMesh: Mesh
  _normalMesh: Mesh
  _updateMesh: Mesh

  //#renderer: M0Renderer

  constructor() {
    super()

    // this.#renderer = M0Renderer.getInstance()

    this._camera = new OrthographicCamera(0, 1, 1, 0, 0, 2000)
    this._geometry = new PlaneGeometry(2, 2)
    this._rtA = new WebGLRenderTarget(256, 256, { type: FloatType })
    this._rtB = new WebGLRenderTarget(256, 256, { type: FloatType })

    this._texture = this._rtA

    this._dropShader = new RawShaderMaterial({
      uniforms: {
        center: { value: [0, 0] },
        radius: { value: 0 },
        strength: { value: 0 },
        texture: { value: null }
      },
      vertexShader,
      fragmentShader: dropFragmentShader
    })

    this._normalShader = new RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
        texture: { value: null }
      },
      vertexShader,
      fragmentShader: normalFragmentShader
    })

    this._updateShader = new RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / 256, 1 / 256] }, // TODO: Remove this useless uniform and hardcode it in shaders?
        texture: { value: null }
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
    this._dropShader.uniforms.texture.value = this._texture
  }

  stepSimulation(): void {
    this.compile(this._updateMesh)
  }

  updateNormals(): void {
    this.compile(this._normalMesh)
  }

  compile(_mesh: Mesh): void {
    console.log('compile', _mesh)
  }
}
