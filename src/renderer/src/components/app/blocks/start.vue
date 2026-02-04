<template>
  <div class="start">
    <div ref="$circle" class="circle"></div>
    <button :class="{ 'is-pressed': isStartPressed }">
      <img src="/assets/button.webp" alt="start" draggable="false" />
      <template v-if="!qrCode">
        <p>Start</p>
      </template>
      <template v-else>
        <img class="qr" src="/assets/qr-code.png" alt="qr-code" draggable="false" />
      </template>
    </button>
    <div class="start__footer">
      <template v-if="!qrCode">
        <p>PRESS START TO CREATE YOUR LIGHT BLUE SOUND WAVE</p>
        <p>اضغط على زر البدء لإنشاء موجة صوتية زرقاء فاتحة</p>
      </template>
      <template v-else>
        <p>thank you! scan the qr code to download your light blue playlist</p>
        <p>مسح الكود الثنائي لإنشاء موجة صوتية زرقاء فاتحة</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ref } from 'vue'
import { random } from '@renderer/libs/@math'
import { tryOnBeforeUnmount, tryOnMounted, useIntervalFn } from '@vueuse/core'

const props = defineProps<{
  callback: () => void
  qrCode: boolean
}>()

const $circle = ref<HTMLDivElement>()
const canDraw = ref(true)
const isStartPressed = ref(false)
/* ----------------------------------
   PERFORMANCE CONSTANTS
---------------------------------- */
const MAX_ACTIVE = 6

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
const drawCircle = (force: boolean = false): void => {
  if (!canDraw.value || !$circle.value) return
  if ($circle.value.children.length >= MAX_ACTIVE) return

  const el = getCircle()
  $circle.value.appendChild(el)

  const duration = force ? 1 : random(2.5, 7)

  gsap.fromTo(
    el,
    {
      scale: 0.2,
      opacity: 0.5
    },
    {
      scale: random(8, 12),
      opacity: 0,
      duration,
      ease: 'power2.out',
      onComplete: () => {
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
  if (e.key === 's' || e.key === 'S') {
    drawCircle(true)
    isStartPressed.value = true
    props.callback?.()
  }
}

const onRelease = (e: KeyboardEvent): void => {
  if (e.key === 's' || e.key === 'S') {
    isStartPressed.value = false
  }
}

const addListener = (): void => {
  window.addEventListener('keydown', onPress)
  window.addEventListener('keyup', onRelease)
}

tryOnMounted(() => {
  addListener()
  resume()
})

tryOnBeforeUnmount(() => {
  window.removeEventListener('keydown', onPress)
  window.removeEventListener('keyup', onRelease)
  pause()
})
</script>

<style lang="scss" scoped>
.start {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;

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
      border: 1px solid rgba(255, 255, 255, 0.85);
      background-color: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      opacity: 0;
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
