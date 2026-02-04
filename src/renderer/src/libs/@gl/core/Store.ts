export default class M0Store {
  static instance: M0Store

  #dpr: number = 1

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #assets: Record<string, any> = {}

  static getInstance(): M0Store {
    if (!M0Store.instance) {
      M0Store.instance = new M0Store()
    }
    return M0Store.instance
  }
  constructor() {
    this.#dpr = 0.9 // Math.min(window.devicePixelRatio, 1)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(id: string, asset: any): void {
    this.#assets[id] = asset
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(id: string): any {
    return this.#assets[id]
  }

  get dpr(): number {
    return this.#dpr
  }
}
