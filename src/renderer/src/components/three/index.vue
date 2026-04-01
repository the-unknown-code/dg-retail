<template>
  <div
    id="gl"
    ref="$gl"
    :class="{ 'is-mixing': isMixing, 'is-null': isNull }"
    :style="{ '--scale': $store.scale }"
  >
    <div id="gl--blur" />
    <div id="gl--gradient" />

    <div v-if="!$store.isMobile" :class="['video-wrapper', { 'is-mobile': $store.isMobile }]">
      <video
        type="video/mp4"
        :src="$store.isMobile ? `/videos/caustics_mobile.mp4` : `/videos/caustics.mp4`"
        autoplay
        muted
        loop
        playsinline
      />
    </div>

    <div
      :class="[
        'sound__grid',
        $store.currentCorner,
        {
          'is-dark': $store.midiData[1].value > 55,
          'is-ipad': $store.isIpad,
          'is-mobile': $store.isMobile
        }
      ]"
    >
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
  <slot />
</template>

<script setup lang="ts">
import M0Application from '@renderer/libs/@gl'
import { DAY_PARAMS } from '@renderer/libs/@gl/libs/Const'
import { APP_STATE } from '@renderer/libs/@global/const'
import { useAppStore } from '@renderer/store'
import { useDebounceFn, useWindowSize } from '@vueuse/core'
import { ref, onMounted, watch, effectScope } from 'vue'

const $store = useAppStore()
const { width, height } = useWindowSize()
const $gl = ref<HTMLCanvasElement>()
let $three: M0Application
const scope = effectScope()
const isMixing = ref($store.appState === APP_STATE.MIXING)
const isNull = ref($store.appState === APP_STATE.NULL)

/*
watch(
  () => $store.midiData[1].value,
  (value) => {
    console.log(value)
  }
)
*/

const resize = useDebounceFn((): void => {
  if (!$three) return
  $three.resize()
}, 100)

const initialize = async (): Promise<void> => {
  if (!$gl.value) return

  $three = new M0Application()
  $gl.value.prepend($three.renderer.domElement)

  $three.start()
}

scope.run(() => {
  watch(
    () => $store.currentCorner,
    (v) => {
      if (!v) return

      $store.corners[v] += 1
    }
  )

  watch(
    () => $store.appState,
    () => {
      if ($store.appState === APP_STATE.MIXING) {
        isMixing.value = true
      }
    }
  )

  watch([width, height], () => {
    resize()
  })
})
const PARAMS = {
  causticsOpacity: DAY_PARAMS.causticsOpacity,
  causticsBlendMode: DAY_PARAMS.causticsBlendMode,
  gradientRadius: DAY_PARAMS.gradientRadius,
  gradientOpacity: DAY_PARAMS.gradientOpacity,
  gradientColor: DAY_PARAMS.gradientColor
}

const updateVars = (): void => {
  if (!$gl.value) return
  $gl.value.style.setProperty('--caustics-opacity', String(PARAMS.causticsOpacity))
  $gl.value.style.setProperty('--caustics-blend', PARAMS.causticsBlendMode)
  $gl.value.style.setProperty('--gradient-radius', `${String(PARAMS.gradientRadius)}%`)
  $gl.value.style.setProperty('--gradient-opacity', String(PARAMS.gradientOpacity))
  $gl.value.style.setProperty(
    '--gradient-color',
    `rgb(${PARAMS.gradientColor.r * 255}, ${PARAMS.gradientColor.g * 255}, ${PARAMS.gradientColor.b * 255})`
  )
}

const addTweakpane = (): void => {
  // Check for debug=1 in query params
  const isDebug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1'
  if (!isDebug) return

  //@ts-expect-error - TODO: fix this
  const folder = $store.tweakpane.addFolder({
    title: 'Video',
    expanded: true
  })

  folder.addBinding(PARAMS, 'causticsOpacity', {
    min: 0,
    max: 1,
    step: 0.01
  })

  folder.addBinding(PARAMS, 'causticsBlendMode', {
    options: {
      'plus-lighter': 'plus-lighter',
      normal: 'normal',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      darken: 'darken',
      lighten: 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      difference: 'difference',
      exclusion: 'exclusion',
      hue: 'hue',
      saturation: 'saturation',
      color: 'color',
      luminosity: 'luminosity'
    }
  })

  folder.addBlade({
    view: 'separator'
  })

  /*

    folder.addBinding(PARAMS, 'linesOpacity', {
    min: 0,
    max: 1,
    step: 0.01
  })
ù
  folder.addBinding(PARAMS, 'linesBlendMode', {
    options: {
      'plus-lighter': 'plus-lighter',
      normal: 'normal',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      darken: 'darken',
      lighten: 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      difference: 'difference',
      exclusion: 'exclusion',
      hue: 'hue',
      saturation: 'saturation',
      color: 'color',
      luminosity: 'luminosity'
    }
  })
    */

  folder.addBlade({
    view: 'separator'
  })

  folder.addBinding(PARAMS, 'gradientRadius', {
    min: 0,
    max: 200,
    step: 0.1
  })

  folder.addBinding(PARAMS, 'gradientOpacity', {
    min: 0,
    max: 1,
    step: 0.01
  })

  folder.addBinding(PARAMS, 'gradientColor', {
    color: { type: 'float' }
  })

  folder.on('change', () => {
    if (!$gl.value) return
    updateVars()
  })
}

onMounted(() => {
  initialize()
  addTweakpane()
  updateVars()
})
</script>

<style lang="scss">
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

:root {
  --angle: 0deg;
}

@keyframes rotateGradient {
  0% {
    --angle: 0deg;
  }
  100% {
    --angle: 360deg;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.sound__grid {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  opacity: 0.85;
  // mix-blend-mode: plus-lighter;

  &:not(.is-mobile) {
    mix-blend-mode: hue;
    opacity: 1;
    // mix-blend-mode: plus-lighter;
  }

  &.is-mobile {
    > div {
      filter: none !important;
      width: 512px !important;

      &:nth-child(3) {
        &::before {
          background: radial-gradient(circle, #005577cc 0%, transparent 70%);
        }
      }

      &:nth-child(4) {
        &::before {
          background: radial-gradient(circle, #00ff22dd 0%, transparent 70%);
        }
      }
    }
  }

  &.is-ipad {
    height: 65%;
  }

  &.TL {
    > div {
      &:nth-child(1) {
        transform: scale(1) translate(-50%, -50%);
        opacity: 1;
      }
    }
  }
  &.TR {
    > div {
      &:nth-child(2) {
        transform: scale(1) translate(50%, -50%);
        opacity: 1;
      }
    }
  }
  &.BL {
    > div {
      &:nth-child(3) {
        transform: scale(1) translate(-50%, 50%);
        opacity: 1;
      }
    }
  }
  &.BR {
    > div {
      &:nth-child(4) {
        transform: scale(1) translate(50%, 50%);
        opacity: 1;
      }
    }
  }

  &.is-dark {
    > div {
      &::before {
        opacity: 0;
      }
      &::after {
        opacity: 1;
      }
    }
  }

  > div {
    position: absolute;
    width: 1000px;
    aspect-ratio: 1;
    border-radius: 50%;
    //filter: blur(20px);
    opacity: 0;
    transition: all 0.3s ease-out;

    &:nth-child(1) {
      top: 0;
      left: 0;
      transform: scale(0.5) translate(-100%, -100%);

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, #f5d06bed 0%, transparent 60%);
        border-radius: 50%;
        //filter: blur(20px);
        opacity: 0.9;
      }
    }
    &:nth-child(2) {
      top: 0;
      right: 0;
      transform: scale(0.5) translate(100%, -100%);

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, #f640c0cc 0%, transparent 60%);
        border-radius: 50%;
        //filter: blur(20px);
        opacity: 0.9;
      }
    }
    &:nth-child(3) {
      bottom: 0;
      left: 0;
      transform: scale(0.5) translate(-100%, 100%);

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, #537378 0%, transparent 60%);
        border-radius: 50%;
        //filter: blur(20px);
        opacity: 1;
      }
    }
    &:nth-child(4) {
      bottom: 0;
      right: 0;
      transform: scale(0.5) translate(100%, 100%);

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, #649b83 0%, transparent 60%);
        border-radius: 50%;
        //filter: blur(20px);
        opacity: 0.8;
      }
    }
  }
}

#gl {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  //filter: blur(2px);
  //transition: filter 2s ease-out;

  #dot--video {
    position: absolute;
    width: 100%;
    height: 100%;
    mix-blend-mode: screen;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.35s ease-out;

    > div {
      position: absolute;
      width: 256px;
      height: 256px;
    }

    &.is-active {
      opacity: 1;
      transform: scale(1);
    }

    video {
      position: absolute;
      width: 100%;
      height: 100%;
      transform-origin: center;
      transform: translateY(35%);
    }
  }

  &.is-mixing {
    filter: blur(0px);

    video {
      opacity: 1 !important;
    }
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(var(--scale), var(--scale));
    transition: filter 2s ease-out;
    z-index: 1;
  }

  .video-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    opacity: 0.2;

    &:not(.is-mobile) {
      mix-blend-mode: var(--caustics-blend);
      opacity: var(--caustics-opacity);
    }
  }

  video {
    position: fixed;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.4;
    transition: opacity 1s ease-out;
  }

  #gl--blur {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--blue);
    opacity: 1;
    z-index: 3;
    backdrop-filter: blur(10px);
    display: none;
  }

  #gl--gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 50% 50%,
      #ffffff 0%,
      var(--gradient-color) var(--gradient-radius)
    );
    animation: rotateGradient 30s linear infinite;
    z-index: 2;
    mix-blend-mode: overlay;
    opacity: var(--gradient-opacity);
  }
}
</style>
