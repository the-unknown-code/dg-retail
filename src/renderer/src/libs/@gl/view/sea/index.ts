import { MathUtils, ShaderChunk, Texture, Vector2, Vector3 } from 'three'
import { M0Renderer } from '../../core'
import M0AbstractScene from '../AbstractScene'
import Caustics from './classes/Caustics'
// import Pool from './classes/Pool'
import Water from './classes/Water'
import WaterSimulation from './classes/WaterSimulation'

import utils from '../../shaders/utils.glsl?raw'
//import { randomFloat } from '../../libs/Math'
import { useIntervalFn } from '@vueuse/core'
import { useAppStore } from '@renderer/store'
import { APP_STATE } from '@renderer/libs/@global/const'
import { watch } from 'vue'
import { randomFloat } from '../../libs/Math'

// const THRESHOLD_PX = 1

function getQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

export default class SeaScene extends M0AbstractScene {
  #waterSimulation: WaterSimulation
  #water: Water
  #caustics: Caustics
  // #pool: Pool

  #light: Vector3
  #renderer: M0Renderer

  #lastMouse: Vector2 = new Vector2(0, 0)

  #lastMessageTime = 0
  #THROTTLE_MS = 1

  #addDrop: () => void
  #pause!: () => void
  // #resume: () => void

  #store: ReturnType<typeof useAppStore>

  constructor() {
    super()

    this.#store = useAppStore()
    this.camera.position.set(0, 2.4, 0)
    this.camera.rotation.set(-Math.PI / 2, 0, 0)

    ShaderChunk['utils'] = utils
    this.#renderer = M0Renderer.getInstance()
    this.#light = new Vector3(0.0755928946018454, 1.15, 0.0779644730092272)

    this.#waterSimulation = new WaterSimulation(this.#renderer)
    this.#water = new Water(this.#renderer, this.#light, this.camera)
    this.#caustics = new Caustics(this.#renderer, this.#water.geometry, this.#light)

    this.#lastMouse.copy(this.viewport.mouseGL)

    // this.#pool = new Pool(this.#renderer, this.#light, this.camera)
    // this.#pool = new Pool(this.#renderer, this.#light, this.camera)
    this.#addDrop = this.addDrop.bind(this)

    const { pause } = useIntervalFn(this.#addDrop, 1200, { immediate: false })
    this.#pause = pause
    // this.#resume = resume

    const iPad = getQueryParam('ipad') === '1'

    if (!iPad) {
      watch(
        () => this.#store.midiData[2].value,
        () => {
          if (this.#store.appState !== APP_STATE.MIXING && this.#store.appState !== APP_STATE.NULL)
            return

          const o = this.#store.pinState
          const scale = 1.5
          const nx = o.nx / scale
          const ny = o.ny / scale

          this.#waterSimulation.addDrop(
            nx,
            ny,
            randomFloat(0.025, 0.065) + MathUtils.clamp(Math.max(o.vx, o.vy), 0.01, 2) / 50,
            randomFloat(0.03, 0.03) + Math.max(o.vx, o.vy) / 1000
          )
        }
      )

      watch(
        () => this.#store.midiData[3].value,
        () => {
          if (this.#store.appState !== APP_STATE.MIXING && this.#store.appState !== APP_STATE.NULL)
            return

          const o = this.#store.pinState
          const scale = 1.5
          const nx = o.nx / scale
          const ny = o.ny / scale
          this.#waterSimulation.addDrop(
            nx,
            ny,
            randomFloat(0.025, 0.065) + MathUtils.clamp(Math.max(o.vx, o.vy), 0.01, 2) / 50,
            randomFloat(0.03, 0.03) + Math.max(o.vx, o.vy) / 1000
          )
        }
      )
    } else {
      watch(
        () => this.#store.pinState,

        (o) => {
          const now = performance.now()
          if (now - this.#lastMessageTime < this.#THROTTLE_MS) return
          this.#lastMessageTime = now

          this.#waterSimulation.addDrop(
            o.nx,
            o.ny,
            randomFloat(0.05, 0.085) + MathUtils.clamp(Math.max(o.vx, o.vy), 0.01, 2) / 100,
            randomFloat(0.01, 0.03) + Math.max(o.vx, o.vy) / 1000
          )
        }
      )
    }

    // this.#resume()

    /*
    const $store = useAppStore()

    watch(
      () => $store.appState,
      () => {
        if ($store.appState === APP_STATE.MIXING || $store.appState === APP_STATE.NULL) {
          this.#pause()
        } else {
          this.#resume()
        }
      }
    )
    */
  }

  addDrop(): void {
    this.#waterSimulation.addDrop(
      randomFloat(-0.7, 0.7),
      randomFloat(0.95, 1),
      randomFloat(0.0002, 0.003),
      randomFloat(-0.015, 0.015)
    )
  }

  pauseDrops(): void {
    this.#pause()
  }

  override render(_time: number, _dt: number): void {
    super.render(_time, _dt)

    const dxNDC = this.viewport.mouseGL.x - this.#lastMouse.x
    const dyNDC = this.viewport.mouseGL.y - this.#lastMouse.y

    const dxPx = dxNDC * (this.viewport.width / 2)
    const dyPx = dyNDC * (this.viewport.height / 2)

    const THRESHOLD_PX = 1
    const distPxSq = dxPx * dxPx + dyPx * dyPx
    const scale = 1.5
    const nx = this.viewport.mouseGL.x / scale
    const ny = this.viewport.mouseGL.y / scale

    if (distPxSq > THRESHOLD_PX * THRESHOLD_PX) {
      this.#waterSimulation.addDrop(
        nx,
        ny,
        randomFloat(0.015, 0.035) + MathUtils.clamp(this.viewport.speed, 0.01, 2) / 100,
        randomFloat(0.01, 0.03)
      )

      this.#lastMouse.copy(this.viewport.mouseGL)
    }

    this.#waterSimulation.stepSimulation()
    this.#waterSimulation.updateNormals()

    const waterTexture: Texture = this.#waterSimulation.texture
    this.#caustics.update(waterTexture)

    this.#renderer.r.setRenderTarget(null)
    this.#renderer.r.setClearColor(0xffffff, 1)
    this.#renderer.r.clear()

    const causticTexture: Texture = this.#caustics.texture

    // this.#debug.update(causticTexture)
    this.#water.update(waterTexture, causticTexture)
    // this.#pool.update(waterTexture, causticTexture)
  }

  override resize(): void {
    super.resize()
    this.#water.resize()
  }
}
