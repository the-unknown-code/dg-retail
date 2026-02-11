<template>
  <div id="gl" ref="$gl" :class="{ 'is-mixing': isMixing }">
    <div id="gl--gradient" />
    <video src="/videos/caustics.mp4" autoplay muted loop />
  </div>
</template>

<script setup lang="ts">
import M0Application from '@renderer/libs/@gl'
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

const resize = useDebounceFn((): void => {
  if (!$three) return
  $three.resize()
}, 100)

const initialize = (): void => {
  if (!$gl.value) return

  $three = new M0Application()
  $gl.value.appendChild($three.renderer.domElement)

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

onMounted(() => {
  initialize()
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

  &:not(.is-mixing) {
    canvas {
      filter: blur(4px);
    }
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(1.14);
    transition: filter 2s ease-out;
  }

  img,
  video {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
    object-fit: cover;
    mix-blend-mode: screen;
    opacity: 0.15;
    display: none !important;
  }

  video {
    display: block !important;
    z-index: 10;
    opacity: 1;
  }

  #gl--gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(var(--angle), #faf3e9, var(--blue) 50%);
    animation: rotateGradient 30s linear infinite;
    z-index: 2;
    mix-blend-mode: overlay;
    opacity: 0.7;
  }
}
</style>
