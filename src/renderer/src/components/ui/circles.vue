<template>
  <div class="circles">
    <div v-for="i in 5" ref="circles" :key="i" class="circle"></div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap/all'
import { tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core'
import { inject, ref, watch } from 'vue'
import { EVENTS } from '@renderer/libs/@gl/libs/Const'
import { useAppStore } from '@renderer/store'

const props = defineProps<{
  callback: () => void
}>()

const $store = useAppStore()
const emitter = inject('emitter')
const circles = ref<HTMLDivElement[]>([])
const isPressed = ref(false)

const animate = (): void => {
  circles.value.forEach((circle, i) => {
    gsap.to(circle, {
      delay: i * 0.25,
      scale: 1.5,
      opacity: 0.5,
      duration: 2,
      ease: 'power1.inOut',
      stagger: 0.8 / circles.value.length,
      repeat: -1,
      yoyo: true
    })
  })
}

const led = { value: 0 }
gsap.to(led, {
  value: 127,
  duration: 1.35,
  ease: 'none',
  repeat: -1,
  yoyo: true,
  onUpdate: () => {
    //@ts-expect-error TODO: fix this
    emitter.emit(EVENTS.MIDI_LED, { id: 99, value: Math.floor(led.value) })
  }
})

const onPress = (e: KeyboardEvent): void => {
  if (e.key === 'x') {
    if (isPressed.value) return
    isPressed.value = true
    props.callback?.()
  }
}

const addListener = (): void => {
  watch(
    () => $store.midiData[60].input,
    () => {
      if (isPressed.value) return
      isPressed.value = true
      props.callback?.()
    }
  )

  window.addEventListener('keydown', onPress)
}

tryOnMounted(() => {
  addListener()
  animate()
})

tryOnBeforeUnmount(() => {
  window.removeEventListener('keydown', onPress)
  gsap.killTweensOf(led)
  gsap.to(led, {
    value: 0,
    duration: 1,
    ease: 'none',
    onUpdate: () => {
      //@ts-expect-error TODO: fix this
      emitter.emit(EVENTS.MIDI_LED, { id: 99, value: Math.floor(led.value) })
    },
    onComplete: () => {
      //@ts-expect-error TODO: fix this
      emitter.emit(EVENTS.MIDI_LED, { id: 100, value: 0 })
    }
  })
})
</script>

<style lang="scss" scoped>
.circles {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 0;

  .circle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    mix-blend-mode: overlay;
    z-index: 1;
    pointer-events: none;

    display: flex;
    justify-content: center;
    align-items: center;

    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        &::before {
          transform: scale(1 - $i * 0.2);
        }
      }
    }

    &::before {
      content: '';
      position: relative;
      top: 0;
      left: 0;
      width: 100%;
      aspect-ratio: 1;
      background-color: #ffffff22;
      border-radius: 50%;
      transform: scale(1);
      box-shadow: 0 0 10px 0 #279ed166;
    }
  }
}
</style>
