<template>
  <div
    id="gl"
    ref="$gl"
    :class="{ 'is-mixing': isMixing, 'is-null': isNull }"
    :style="{ '--scale': $store.scale }"
  >
    <div id="gl--blur" />
    <div id="gl--gradient" />

    <div class="video-wrapper">
      <video type="video/mp4" src="/videos/caustics.mp4" autoplay muted loop playsinline />
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

#gl {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  //filter: blur(2px);
  //transition: filter 2s ease-out;

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
    transform: scale(var(--scale));
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
    mix-blend-mode: var(--caustics-blend);
    opacity: var(--caustics-opacity);
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
