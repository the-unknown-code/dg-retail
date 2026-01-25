import { AssetType } from '../libs/Const'

export interface ManifestItem {
  id: string
  type: AssetType
  src: string | string[]
}

export const MANIFEST: ManifestItem[] = [
  {
    id: 'tile',
    type: AssetType.TEXTURE,
    src: 'textures/tiles.jpg'
  },
  {
    id: 'env',
    type: AssetType.CUBE_TEXTURE,
    src: [
      'textures/xpos.jpg',
      'textures/xneg.jpg',
      'textures/ypos.jpg',
      'textures/ypos.jpg',
      'textures/zpos.jpg',
      'textures/zneg.jpg'
    ]
  }
]
