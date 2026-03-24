<template>
  <div class="mixing">
    <sound />
    <audio ref="$audio" :src="getSoundUrl('ambience')" playsinline autoplay loop />
  </div>

  <div ref="$fader" class="mixing__fader">
    <Fader animate />
  </div>

  <div
    ref="$timeline"
    :class="[
      'mixing__timeline',
      {
        'is-ipad': $store.isIpad,
        active: $store.playDuration - currentTime <= 5,
        'is-mobile': $store.isMobile
      }
    ]"
  >
    <p class="countdown">{{ $store.playDuration - currentTime }}</p>
    <p>00:{{ String(currentTime).padStart(2, '0') }}</p>
    <div ref="$graph" class="graph">
      <img src="/assets/timeline.svg" alt="graph" />
    </div>
    <p>00:{{ String($store.playDuration).padStart(2, '0') }}</p>
  </div>
</template>

<script setup lang="ts">
import { tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core'
import gsap from 'gsap/all'
import { nextTick, ref, watch } from 'vue'
import Sound from '../blocks/sound.vue'
import Fader from '@renderer/components/ui/fader.vue'
import { fadeVolume } from '@renderer/libs/@tone'
import { useAppStore } from '@renderer/store'
import { APP_STATE } from '@renderer/libs/@global/const'
const currentTime = ref(0)

const props = defineProps<{
  callback: () => void
}>()

let timeout
const $store = useAppStore()
const $timeline = ref<HTMLDivElement>()
const $graph = ref<HTMLDivElement>()
const $audio = ref<HTMLAudioElement>()
const $fader = ref<HTMLElement>()

const initialize = (): void => {
  if (!$graph.value) return
  if (!$fader.value) return

  timeout = setTimeout(() => {
    gsap.to($fader.value as unknown as HTMLDivElement, {
      opacity: 1,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        clearTimeout(timeout)
        gsap.to($fader.value as unknown as HTMLDivElement, {
          delay: 6,
          opacity: 0,
          duration: 1,
          ease: 'power2.inOut'
        })
      }
    })
  }, $store.playDuration * 500)

  const tween = gsap.to($graph.value, {
    width: 297,
    duration: $store.playDuration,
    ease: 'none',
    onUpdate: () => {
      currentTime.value = Math.floor(tween.progress() * $store.playDuration)
    },
    onComplete: () => {
      props.callback?.()
    }
  })
}

const timeline = gsap.timeline({ paused: true })
const animate = (): void => {
  if (!$timeline.value) return

  timeline.to($timeline.value, {
    bottom: 48,
    y: 0,
    opacity: 1,
    ease: 'power4.inOut',
    duration: 1.25
  })
}

const setVolume = (): void => {
  if (!$audio.value) return
  const volume = 1 - $store.midiData[1].value / 127
  $audio.value!.volume = volume
}

let lastValue = $store.midiData[1].value
let killed = false
watch(
  () => $store.midiData[1].value,
  () => {
    if ($store.appState === APP_STATE.MIXING) {
      const delta = Math.abs($store.midiData[1].value - lastValue)
      if (!killed && delta > 10) {
        killed = true
        clearTimeout(timeout)
        gsap.killTweensOf($fader.value as unknown as HTMLDivElement)
        gsap.to($fader.value as unknown as HTMLDivElement, {
          opacity: 0,
          duration: 1,
          ease: 'power2.inOut'
        })
      }

      setVolume()
    }
  }
)

const getSoundUrl = (label: string): string => {
  if (import.meta.env.PROD) {
    // Resolve relative to current page — works for file:// protocol
    return new URL(`sounds/${label}.mp3`, window.location.href).href
  }
  return `/sounds/${label}.mp3`
}

tryOnMounted(async () => {
  await nextTick()
  animate()
  fadeVolume(1)
  initialize()
  timeline.play()
  $audio.value?.play()
  setVolume()
})

tryOnBeforeUnmount(() => {
  fadeVolume(0)
  timeline.reverse()
  if (!$graph.value) return
  gsap.killTweensOf($graph.value)
  $audio.value!.volume = 0
  $audio.value!.pause()
})
</script>

<style lang="scss" scoped>
.mixing {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  z-index: 1;

  &__fader {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    opacity: 0;
  }

  &__timeline {
    position: absolute;
    width: 470px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    left: 50%;
    transform: translate(-50%, 100%);
    bottom: 0;
    padding: 0 var(--app-padding);
    z-index: 1000;
    overflow: hidden;

    backdrop-filter: blur(2px) saturate(1.2);
    -webkit-backdrop-filter: blur(2px) saturate(1.2);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(64, 237, 253, 0.1) 100%);
    transition: all 0.8s ease-in-out;
    border-radius: 30px;
    box-shadow:
    // top edge light catch
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      // bottom cyan tint
      inset 0 -1px 0 rgba(64, 237, 253, 0.2),
      // left edge
      inset 1px 0 rgba(255, 255, 255, 0.08),
      // right edge
      inset -1px 0 rgba(255, 255, 255, 0.8),
      // outer glow
      0 8px 32px rgba(15, 184, 240, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.2);

    &.is-ipad {
      margin-bottom: 310px;
      opacity: 0;
    }

    &.is-mobile {
      margin-bottom: 0;
      transform: translate(-50%, -39vh) scale(0.65) !important;
    }

    &.active {
      width: 100px;

      p {
        opacity: 0;
        &.countdown {
          transform: translateY(-50%);
          opacity: 1 !important;
        }
      }

      .graph {
        opacity: 0;
      }
    }

    .graph {
      position: relative;
      width: 0%;
      height: 68px;
      transform: translateY(5px);
      overflow: hidden;
      transition: all 1s ease-out;

      svg,
      img {
        position: absolute;
        width: 297px;
        height: 68px;
        z-index: 1;
        max-width: unset;
      }
    }

    p {
      font-size: 14px;
      &.countdown {
        color: white;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        text-align: center;
        font-size: 40px;
        opacity: 0;
        transform: translateY(50%);
        transition: all 1s ease-out;
        padding-left: 4px;
      }
    }
  }
}
</style>
