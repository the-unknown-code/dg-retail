<template>
  <div class="start">
    <div ref="$circle" class="circle"></div>

    <div class="language">
      <div
        v-for="(language, index) in LANGUAGES"
        ref="$languageItems"
        :key="language"
        :class="['language--item', { 'is-active': activeLanguage === index }]"
      >
        <span>{{ language }}</span>
      </div>
    </div>

    <div class="info">
      <animated-text text="SELECT YOUR LANGUAGE AND PRESS START" />
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ref, watch, inject } from 'vue'
import AnimatedText from '@renderer/components/ui/animated-text.vue'
import { tryOnBeforeUnmount, tryOnMounted, useIntervalFn } from '@vueuse/core'
import { useAppStore } from '@renderer/store'
import { EVENTS } from '@renderer/libs/@gl/libs/Const'

const props = defineProps<{
  callback: () => void
  qrCode: boolean
}>()

const $languageItems = ref<HTMLDivElement[]>([])
const activeLanguage = ref(0)
const LANGUAGES = [
  'English',
  'Italiano',
  'DEUTSCH',
  'ESPAÑOL',
  'عربي',
  'FRANÇAIS',
  'PORTUGUÊS',
  '中国人',
  '日本語'
]

const $store = useAppStore()
const $circle = ref<HTMLDivElement>()
const canDraw = ref(true)
const isStartPressed = ref(false)

/* ----------------------------------
   PERFORMANCE CONSTANTS
---------------------------------- */
const MAX_ACTIVE = 99

/* ----------------------------------
   ACTIVE COUNT (replaces children.length reads)
---------------------------------- */
let activeCount = 0

/* ----------------------------------
   ELEMENT POOL
---------------------------------- */
const pool: HTMLDivElement[] = []

const getCircle = (): HTMLDivElement => {
  if (pool.length) return pool.pop()!

  const el = document.createElement('div')
  el.className = 'circle--item'
  return el
}

const releaseCircle = (el: HTMLDivElement): void => {
  gsap.set(el, { clearProps: 'all' })
  pool.push(el)
}

/* ----------------------------------
   DRAW FUNCTION
---------------------------------- */
const drawCircle = (): void => {
  if (!canDraw.value || !$circle.value) return
  if (activeCount >= MAX_ACTIVE) return

  const el = getCircle()
  activeCount++
  $circle.value.appendChild(el)

  gsap.fromTo(
    el,
    {
      scale: 0.01,
      opacity: 0.5
    },
    {
      scale: 20,
      opacity: 0,
      duration: 12,
      ease: 'power2.out',
      onComplete: () => {
        activeCount--
        el.remove()
        releaseCircle(el)
      }
    }
  )
}

/* ----------------------------------
   INTERVAL
---------------------------------- */
const { resume, pause } = useIntervalFn(drawCircle, 1200, {
  immediate: false
})

const onPress = (e: KeyboardEvent): void => {
  if (e.key === 'x' || e.key === 'X') {
    if (isStartPressed.value) return
    drawCircle()
    isStartPressed.value = true
    props.callback?.()
  }
}

const addListener = (): void => {
  window.addEventListener('keydown', onPress)
}

const canChange = ref(true)

watch(
  () => [$store.midiData[2].value, $store.midiData[3].value],
  ([val2, val3]: number[]) => {
    const CENTER = 64
    const DEADZONE = 4
    const value = val2 !== 64 ? val2 : val3

    if (!canChange.value) return

    if (value > CENTER + DEADZONE) {
      activeLanguage.value = (activeLanguage.value + 1) % LANGUAGES.length
      canChange.value = false
      setTimeout(() => (canChange.value = true), 400)
    } else if (value < CENTER - DEADZONE) {
      activeLanguage.value = (activeLanguage.value - 1 + LANGUAGES.length) % LANGUAGES.length
      canChange.value = false
      setTimeout(() => (canChange.value = true), 400)
    }
  }
)

watch(
  () => $store.midiData[60].input,
  (value: number) => {
    if (value > 0) {
      if (isStartPressed.value) return

      drawCircle()
      isStartPressed.value = true
      props.callback?.()
    }
  }
)

const emitter = inject('emitter')
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

const animate = (value: boolean): void => {
  gsap.to($languageItems.value, {
    duration: 1.5,
    ease: 'power2.inOut',
    opacity: value ? 1 : 0,
    scale: 1,
    y: 0,
    stagger: {
      each: 0.1,
      from: 'center'
    }
  })
}

tryOnMounted(() => {
  animate(true)
  addListener()
  resume()
})

tryOnBeforeUnmount(() => {
  gsap.killTweensOf(led)

  gsap.killTweensOf([led])
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
      emitter?.emit(EVENTS.MIDI_LED, { id: 100, value: 0 })
    }
  })

  window.removeEventListener('keydown', onPress)
  pause()
})
</script>

<style lang="scss" scoped>
.svg-filters {
  position: fixed;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.start {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  z-index: 99;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--blue);
    opacity: 0.3;
  }

  .info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 16px;
    padding: 64px 32px;
  }

  .language {
    position: relative;
    display: flex;
    gap: 8px;

    &--item {
      position: relative;
      white-space: nowrap;
      text-transform: uppercase;
      font-size: 14px;
      padding: 10px 24px;
      border-radius: 32px;
      background-color: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(10px);
      transform: scale(1.15);
      opacity: 0;

      border: 0.5px solid rgba(255, 255, 255, 0.39);
      box-shadow:
        0 1px 0 0 rgba(255, 255, 255, 1) inset,
        0 -1px 0 0 rgba(255, 255, 255, 0.3) inset,
        0 4px 24px rgba(0, 0, 0, 0.08),
        0 1px 3px rgba(0, 0, 0, 0.12);

      &.is-active {
        background-color: var(--blue);
        border: 0.5px solid rgba(255, 255, 255, 0.09);

        box-shadow:
          0 1px 0 0 rgba(255, 255, 255, 0.5) inset,
          0 -1px 0 0 rgba(255, 255, 255, 0.3) inset,
          0 4px 24px rgba(0, 0, 0, 0.08),
          0 1px 3px rgba(0, 0, 0, 0.12);

        span {
          color: white;
          text-shadow: unset;
        }
      }

      span {
        position: relative;
        z-index: 2;
        color: rgba(30, 120, 180, 0.9);
        text-shadow: 0 1px 4px rgba(255, 255, 255, 0.5);
        line-height: 1cap;
      }
    }

    span {
      position: relative;
      z-index: 1;
    }
  }

  .circle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    mix-blend-mode: overlay;
    z-index: 1;
    pointer-events: none;

    &:deep(.circle--item) {
      position: absolute;
      width: 10%;
      aspect-ratio: 1;
      border-radius: 50%;
      background-color: #ffffff55;
      transform-origin: center;
      will-change: transform, opacity;
    }
  }

  button {
    position: relative;
    width: 252px;
    height: 76px;
    flex: 0 0 252px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 180ms ease-out;
    backdrop-filter: blur(10px);

    &.is-pressed {
      transition-duration: 40ms;
      transform: scale(0.9);
    }

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;

      &.qr {
        position: relative;
        width: 100px;
        height: 100px;
        mix-blend-mode: multiply;
      }
    }

    p {
      position: relative;
      text-transform: uppercase;
      font-size: 22px;
      opacity: 1;
      transition: opacity 180ms ease-out;
      text-shadow: 0 0 60px rgba(255, 255, 255, 0.8);
    }
  }

  &__footer {
    position: absolute;
    bottom: var(--app-padding);
    left: 0;
    width: 100%;
    margin-top: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--app-gap);

    p {
      font-size: 16px;
      text-shadow:
        0 1px 24px rgba(255, 255, 255, 0.6),
        0 2px 50px #fff;
    }
  }
}
</style>
