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
import { useAppStore } from '@renderer/store'
import { watch } from 'vue'
import { APP_STATE } from '@renderer/libs/@global/const'
import gsap from 'gsap/all'
import { DAY_PARAMS } from '@renderer/libs/@gl/libs/Const'

export default class Water {
  _geometry: PlaneGeometry
  _shader: ShaderMaterial

  _mesh: Mesh
  _camera: PerspectiveCamera

  #pinia: ReturnType<typeof useAppStore>
  #store: M0Store
  #renderer: M0Renderer

  constructor(renderer: M0Renderer, light: Vector3, camera: PerspectiveCamera) {
    this._camera = camera
    this.#renderer = renderer

    this.#pinia = useAppStore()
    this.#store = M0Store.getInstance()
    const $store = useAppStore()

    const segments = $store.isMobile ? 256 : 512

    this._geometry = new PlaneGeometry(2, 2, segments, segments)
    this._shader = new ShaderMaterial({
      uniforms: {
        globalDay: { value: DAY_PARAMS.globalDay },
        globalNight: { value: DAY_PARAMS.globalNight },
        light: { value: light },
        tiles: { value: this.#store.get('tile') },
        sky: { value: this.#store.get('env') },
        fader: { value: 1.0 },
        water: { value: null },
        elevationScale: { value: 2 },
        causticTex: { value: null },
        underwater: { value: false }
      },
      vertexShader,
      fragmentShader
    })

    this._mesh = new Mesh(this._geometry, this._shader)

    const midiToExp = (input: number): number => {
      const t = input / 127
      return Math.pow(t, 0.415) // tuned so 64/127 ≈ 0.75
    }

    watch(
      () => this.#pinia.midiData[1].value,
      () => {
        if (this.#pinia.appState !== APP_STATE.MIXING) return
        gsap.killTweensOf(this._shader.uniforms.fader)
        this._shader.uniforms.fader.value = 1 - midiToExp(this.#pinia.midiData[1].value)
      }
    )

    watch(
      () => this.#pinia.midiData[1].input,
      () => {
        if (this.#pinia.appState !== APP_STATE.MIXING) return
        gsap.killTweensOf(this._shader.uniforms.fader)
        this._shader.uniforms.fader.value = 1 - midiToExp(this.#pinia.midiData[1].value)
      }
    )

    watch(
      () => $store.appState,
      (value) => {
        if (value !== APP_STATE.MIXING) return
        const fade = 1 - this.#pinia.midiData[1].value / 127
        gsap.to(this._shader.uniforms.fader, {
          duration: 1,
          ease: 'power2.out',
          value: fade
        })
      }
    )

    setTimeout(() => {
      const isDebug =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('debug') === '1'

      const PARAMS = {
        globalDay: this._shader.uniforms.globalDay.value,
        globalNight: this._shader.uniforms.globalNight.value
      }

      if (isDebug && $store.tweakpane) {
        //@ts-expect-error - TODO: fix this
        const folder = $store.tweakpane.addFolder({
          title: 'Water',
          expanded: true
        })

        folder.addBinding(PARAMS, 'globalDay', {
          color: { type: 'float' }
        })
        folder.addBinding(PARAMS, 'globalNight', {
          color: { type: 'float' }
        })
      }
    }, 10)
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
    const PADDING = 0
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
