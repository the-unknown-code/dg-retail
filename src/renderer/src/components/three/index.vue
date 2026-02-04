<template>
  <div id="gl" ref="$gl">
    <img src="/assets/noise.webp" alt="background" />
    <div id="gl--gradient"></div>
  </div>
</template>

<script setup lang="ts">
import M0Application from '@renderer/libs/@gl'
import { useDebounceFn, useWindowSize } from '@vueuse/core'
import { ref, onMounted, watch, effectScope } from 'vue'

const { width, height } = useWindowSize()
const $gl = ref<HTMLCanvasElement>()
let $three: M0Application
const scope = effectScope()

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

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(1.14);
  }

  img {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
    object-fit: cover;
    mix-blend-mode: screen;
    opacity: 0.15;
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
