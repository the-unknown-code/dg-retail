import { MathUtils, ShaderChunk, Texture, Vector2, Vector3 } from 'three'
import { M0Renderer } from '../../core'
import M0AbstractScene from '../AbstractScene'
import Caustics from './classes/Caustics'
import Pool from './classes/Pool'
import Water from './classes/Water'
import WaterSimulation from './classes/WaterSimulation'

import utils from '../../shaders/utils.glsl?raw'
//import { randomFloat } from '../../libs/Math'
import { useIntervalFn } from '@vueuse/core'
import { random } from '@renderer/libs/@math'
import { useAppStore } from '@renderer/store'
import { APP_STATE } from '@renderer/libs/@global/const'
import { watch } from 'vue'
import { randomFloat } from '../../libs/Math'

// const THRESHOLD_PX = 1

export default class SeaScene extends M0AbstractScene {
  #waterSimulation: WaterSimulation
  #water: Water
  #caustics: Caustics
  #pool: Pool

  #light: Vector3
  #renderer: M0Renderer

  #lastMouse: Vector2 = new Vector2(0, 0)

  #addDrop: () => void
  #pause!: () => void
  #resume: () => void

  #store: ReturnType<typeof useAppStore>

  constructor() {
    super()

    this.#store = useAppStore()
    this.camera.position.set(0, 2.4, 0)
    this.camera.rotation.set(-Math.PI / 2, 0, 0)

    ShaderChunk['utils'] = utils
    this.#renderer = M0Renderer.getInstance()
    this.#light = new Vector3(0.007559289460184544, 1.2, 0.0779644730092272)

    this.#waterSimulation = new WaterSimulation(this.#renderer)
    this.#water = new Water(this.#renderer, this.#light, this.camera)
    this.#caustics = new Caustics(this.#renderer, this.#water.geometry, this.#light)

    this.#lastMouse.copy(this.viewport.mouseGL)

    // this.#pool = new Pool(this.#renderer, this.#light, this.camera)
    this.#pool = new Pool(this.#renderer, this.#light, this.camera)
    this.#addDrop = this.addDrop.bind(this)

    const { pause, resume } = useIntervalFn(this.#addDrop, 3200, { immediate: false })
    this.#pause = pause
    this.#resume = resume

    watch(
      () => this.#store.midiData[2].value,
      () => {
        this.#waterSimulation.addDrop(
          this.#store.midiData[2].x,
          this.#store.midiData[2].y,
          randomFloat(0.02, 0.03) * MathUtils.clamp(this.viewport.speed, 0.85, 6.5),
          randomFloat(0.02, 0.05)
        )
      }
    )

    watch(
      () => this.#store.midiData[3].value,
      () => {
        this.#waterSimulation.addDrop(
          this.#store.midiData[3].x,
          this.#store.midiData[3].y,
          randomFloat(0.02, 0.03) * MathUtils.clamp(this.viewport.speed, 0.85, 6.5),
          randomFloat(0.02, 0.05)
        )
      }
    )

    // this.#resume()

    const $store = useAppStore()
    watch(
      () => $store.appState,
      () => {
        if ($store.appState === APP_STATE.MIXING) {
          this.#pause()
        } else {
          this.#resume()
        }
      }
    )
  }

  addDrop(): void {
    this.#waterSimulation.addDrop(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 0.2 + 0.01,
      random(-0.25, 0.25)
    )
  }

  pauseDrops(): void {
    this.#pause()
  }

  override render(_time: number, _dt: number): void {
    super.render(_time, _dt)

    /*
    const dxNDC = this.viewport.mouseGL.x - this.#lastMouse.x
    const dyNDC = this.viewport.mouseGL.y - this.#lastMouse.y

    const dxPx = dxNDC * (this.viewport.width / 2)
    const dyPx = dyNDC * (this.viewport.height / 2)

    const THRESHOLD_PX = 1
    const distPxSq = dxPx * dxPx + dyPx * dyPx
    if (distPxSq > THRESHOLD_PX * THRESHOLD_PX) {
      this.#waterSimulation.addDrop(
        this.viewport.mouseGL.x,
        this.viewport.mouseGL.y,
        randomFloat(0.02, 0.03) * MathUtils.clamp(this.viewport.speed, 0.85, 6.5),
        randomFloat(0.02, 0.05)
      )

      this.#lastMouse.copy(this.viewport.mouseGL)
    }
    */

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
    this.#pool.update(waterTexture, causticTexture)
  }

  override resize(): void {
    super.resize()
    this.#water.resize()
  }
}
