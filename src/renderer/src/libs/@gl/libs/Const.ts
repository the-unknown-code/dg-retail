import { Color } from 'three'

export enum AssetType {
  TEXTURE = 'texture',
  CUBE_TEXTURE = 'cube_texture',
  FONT = 'font'
}

export enum EVENTS {
  MIDI_LED = 'midi:led',
  JOGWHEEL_FX = 'jogwheel:fx'
}

export const DAY_PARAMS = {
  causticsOpacity: 0.8,
  causticsBlendMode: 'overlay',
  gradientRadius: 200,
  gradientOpacity: 0.7,
  gradientColor: { r: 0, g: 0.68, b: 1 },
  globalDay: new Color(0.47, 0.81, 1),
  globalNight: new Color(0.08, 0.37, 0.6)
}
