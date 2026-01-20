export default class M0Store {
  static instance: M0Store

  #dpr: number = 1

  static getInstance(): M0Store {
    if (!M0Store.instance) {
      M0Store.instance = new M0Store()
    }
    return M0Store.instance
  }
  constructor() {
    this.#dpr = Math.min(window.devicePixelRatio, 2)
  }

  get dpr(): number {
    return this.#dpr
  }
}
