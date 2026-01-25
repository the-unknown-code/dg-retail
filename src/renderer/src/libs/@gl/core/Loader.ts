import { CubeTexture, CubeTextureLoader, FileLoader, Texture, TextureLoader } from 'three'
import { ManifestItem } from '../data/manifest'
import { AssetType } from '../libs/Const'
import M0Store from './Store'

export default class M0Loader {
  static instance: M0Loader

  #store: M0Store

  #fileLoader: FileLoader
  #textureLoader: TextureLoader
  #cubeTextureLoader: CubeTextureLoader

  static getInstance(): M0Loader {
    if (!M0Loader.instance) {
      M0Loader.instance = new M0Loader()
    }
    return M0Loader.instance
  }

  constructor() {
    this.#store = M0Store.getInstance()

    this.#fileLoader = new FileLoader()
    this.#textureLoader = new TextureLoader()
    this.#cubeTextureLoader = new CubeTextureLoader()
  }

  async preload(manifest: ManifestItem[]): Promise<void> {
    const promises: Promise<void>[] = []
    for (const item of manifest) {
      if (item.type === AssetType.TEXTURE) {
        promises.push(this.loadTexture(item))
      } else if (item.type === AssetType.CUBE_TEXTURE) {
        promises.push(this.loadCubeTexture(item))
      }
    }

    await Promise.all(promises)
  }

  async loadTexture(item: ManifestItem): Promise<void> {
    console.log('loadTexture', item)
    const texture = (await this.#textureLoader.loadAsync(item.src as string)) as Texture
    this.#store.set(item.id, texture)
  }

  async loadCubeTexture(item: ManifestItem): Promise<void> {
    console.log('loadCubeTexture', item)
    const cubeTexture = (await this.#cubeTextureLoader.loadAsync(
      item.src as string[]
    )) as CubeTexture
    this.#store.set(item.id, cubeTexture)
  }

  loadFile(src: string): Promise<string> {
    return this.#fileLoader.loadAsync(src) as Promise<string>
  }
}
