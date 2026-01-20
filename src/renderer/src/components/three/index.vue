<template>
  <canvas id="canvas" ref="$canvas" />
</template>

<script setup lang="ts">
import M0Application from '@renderer/libs/@gl'
import { useDebounceFn, useWindowSize } from '@vueuse/core'
import { ref, onMounted, watch, effectScope } from 'vue'

const { width, height } = useWindowSize()
const $canvas = ref<HTMLCanvasElement>()
let $three: M0Application
const scope = effectScope()

const resize = useDebounceFn((): void => {
  if (!$three) return
  $three.resize(width.value, height.value)
}, 100)

const initialize = (): void => {
  if (!$canvas.value) return

  $three = new M0Application({}, $canvas.value)
  resize()
}

scope.run(() => {
  watch([width, height], resize)
})

onMounted(() => {
  initialize()
})
</script>
