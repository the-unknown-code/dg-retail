import M0AbstractScene from '../AbstractScene'
import { Mesh, MeshNormalMaterial, SphereGeometry } from 'three'

export default class SeaScene extends M0AbstractScene {
  constructor() {
    super()

    const sphere: Mesh = new Mesh(new SphereGeometry(1, 8, 8), new MeshNormalMaterial())
    this.scene.add(sphere)
  }
}
