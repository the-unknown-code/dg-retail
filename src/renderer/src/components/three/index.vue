<template>
  <div id="gl" ref="$gl"></div>
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
    border: 10px solid red;
  }
}
</style>
