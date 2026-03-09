<template>
  <div class="animated-text">
    <p ref="$text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { tryOnMounted } from '@vueuse/core'
import gsap, { SplitText } from 'gsap/all'
import { ref } from 'vue'

const props = defineProps<{
  text: string
  delay?: number
}>()

const $text = ref<HTMLParagraphElement>()

const animate = (): void => {
  if (!$text.value) return

  const $st = new SplitText($text.value, {
    type: 'words, chars',
    charsClass: 'char'
  })

  gsap.set($st.chars, {
    opacity: 0
  })

  gsap.to($st.chars, {
    delay: props.delay ?? 0,
    duration: 2,
    ease: 'power2.inOut',
    opacity: 1,
    stagger: {
      each: 0.5 / $st.chars.length,
      from: 'center'
    }
  })
}

tryOnMounted(() => {
  animate()
})
</script>

<style lang="scss" scoped>
.animated-text {
  position: relative;

  p {
    text-shadow: 2px 1px 6px #00000033;
  }
}
</style>
