import { Vector2 } from 'three'
import { ref, Ref } from 'vue'
import { useMouse, useWindowSize } from '@vueuse/core'
import { lerp } from '../libs/Math'

export default class M0Viewport {
  static instance: M0Viewport

  #width: Ref<number> = ref(0)
  #height: Ref<number> = ref(0)
  #x: Ref<number> = ref(0)
  #y: Ref<number> = ref(0)
  #mouse: Vector2 = new Vector2(0.5, 0.5)

  #prevMouseGL: Vector2 = new Vector2(0, 0)
  #mouseGL: Vector2 = new Vector2(0, 0)
  #speed: number = 0

  static getInstance(): M0Viewport {
    if (!M0Viewport.instance) {
      M0Viewport.instance = new M0Viewport()
    }
    return M0Viewport.instance
  }

  constructor() {
    const { width, height } = useWindowSize()
    const { x, y } = useMouse()

    this.#width = width
    this.#height = height
    this.#x = x
    this.#y = y
    this.#mouse = new Vector2(0, 0)

    this.#prevMouseGL = new Vector2(0, 0)
    this.#mouseGL = new Vector2(0, 0)
  }

  render(_time: number, dt: number): void {
    const deltaSec = dt * 0.001
    const lerpMouse = 1 - Math.exp(-6 * deltaSec)

    const nx: number = (this.#x.value / this.#width.value) * 2 - 1
    const ny: number = (this.#y.value / this.#height.value) * 2 - 1

    this.#mouseGL.set(nx, ny)

    // --- SPEED (distance per second in NDC space)
    const dx = this.#mouseGL.x - this.#prevMouseGL.x
    const dy = this.#mouseGL.y - this.#prevMouseGL.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const rawSpeed = deltaSec > 0 ? distance / deltaSec : 0
    this.#speed = lerp(this.#speed, rawSpeed, lerpMouse)

    const lx: number = lerp(this.#mouse.x, nx, lerpMouse)
    const ly: number = lerp(this.#mouse.y, ny, lerpMouse)

    this.#mouse.set(lx, ly)

    // --- Store previous
    this.#prevMouseGL.copy(this.#mouseGL)
  }

  get speed(): number {
    return this.#speed
  }

  get mouseGL(): Vector2 {
    return this.#mouse
  }

  get mouse(): Vector2 {
    return this.#mouse
  }

  get width(): number {
    return this.#width.value
  }

  get height(): number {
    return this.#height.value
  }
}
