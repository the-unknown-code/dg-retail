<template>
  <div ref="$block" class="block block--null"></div>
</template>

<script setup lang="ts">
import { tryOnMounted } from '@vueuse/core'
import gsap from 'gsap/all'
import { ref } from 'vue'
import { useAppStore } from '@renderer/store'
import { APP_STATE } from '@renderer/libs/@global/const'

const $store = useAppStore()
const $block = ref<HTMLDivElement>()

tryOnMounted(() => {
  if (!$block.value) return
  gsap.to($block.value, {
    duration: 1,
    onComplete: () => {
      $store.appState = APP_STATE.START
    }
  })
})
</script>

<style scoped>
.block--null {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, var(--blue) 0%, black 200%);
}
</style>
