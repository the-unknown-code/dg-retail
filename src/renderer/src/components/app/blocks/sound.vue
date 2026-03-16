<template>
  <div class="sound">
    <div v-if="!$store.isIpad" ref="$content" class="sound__content">
      <div class="sound--item">
        <animated-text text="FUNKY" />
      </div>
      <div class="sound--item">
        <animated-text text="PARTY" />
      </div>
      <div class="sound--item">
        <animated-text text="CHILL" />
      </div>
      <div class="sound--item">
        <animated-text text="GROOVY" />
      </div>
    </div>

    <div id="dot" ref="$dot" :class="{ 'is-ipad': $store.isIpad }">
      <div id="dot--svg" ref="$dotSvg">
        <img class="bloom" src="/assets/bloom.png" />
        <img class="ellipse" src="/assets/ellipse.png" />
      </div>

      <!-- SVG Glass Orb -->
      <svg
        v-if="!$store.isIpad"
        class="dot__svg"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Refraction displacement map -->
          <filter id="glass-refract" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035 0.04"
              numOctaves="3"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3.5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />
            <feComposite in="blurred" in2="SourceGraphic" operator="atop" />
          </filter>

          <!-- Outer bloom -->
          <filter id="bloom" x="-50%" y="-50%" width="100%" height="100%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0
                      0 0.78 0 0 0
                      0 0 1 0 0
                      0 0 0 1.4 0"
              result="tinted"
            />
            <feMerge>
              <feMergeNode in="tinted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="rim-light" cx="49%" cy="49%" r="50%">
            <stop offset="82%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="92%" stop-color="#7de0ff" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.6" />
          </radialGradient>

          <linearGradient id="edge-shine" x1="60%" y1="40%" x2="40%" y2="20%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
            <stop offset="40%" stop-color="#279ed1" stop-opacity="0.1" />
            <stop offset="60%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#279ed1" stop-opacity="0.3" />
          </linearGradient>

          <clipPath id="circle-clip">
            <circle cx="24" cy="24" r="22" />
          </clipPath>
        </defs>

        <!-- Bloom halo (behind everything) -->
        <circle
          class="dot__bloom"
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="#00c8ff"
          stroke-width="1"
          filter="url(#bloom)"
          opacity="0"
        />

        <!-- Glass body with refraction -->
        <circle
          cx="48"
          cy="48"
          r="24"
          fill="url(#glass-body)"
          filter="url(#glass-refract)"
          clip-path="url(#circle-clip)"
        />

        <!-- Rim light -->
        <circle cx="24" cy="24" r="22" fill="url(#rim-light)" />

        <!-- Edge stroke with gradient -->
        <circle cx="24" cy="24" r="21.5" fill="none" stroke="url(#edge-shine)" stroke-width="1" />
      </svg>

      <!-- Ripple rings -->
      <div class="dot__ring dot__ring--1" />
      <div class="dot__ring dot__ring--2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@renderer/store'
import { tryOnBeforeUnmount, tryOnMounted, useTimeoutFn } from '@vueuse/core'
import AnimatedText from '@renderer/components/ui/animated-text.vue'
import Tempus from 'tempus'
import { lerp } from 'three/src/math/MathUtils.js'
import { ref, watch } from 'vue'
import gsap from 'gsap/all'

const $store = useAppStore()
const $content = ref<HTMLDivElement | null>(null)
const $dot = ref<HTMLDivElement | null>(null)
const $dotSvg = ref<HTMLDivElement | null>(null)

const initialize = (): void => {
  if (!$content.value) return
  const $items = $content.value.querySelectorAll('.sound--item')
  gsap.to($items, {
    delay: 0.05,
    x: 0,
    y: 0,
    duration: 1.75,
    ease: 'power4.inOut',
    stagger: 0.1
  })
}

const reset = (): void => {
  if (!$dot.value) return
  if ($store.isIpad) return
  $store.isActive = false
  $dot.value.classList.remove('is-active')
}

const position = { ...$store.pinState }
const velocity = { x: 0, y: 0 }
const prev = { x: $store.pinState.x, y: $store.pinState.y }
let currentAngle = 0
let currentScaleX = 1
let currentScaleY = 1

const { start, stop } = useTimeoutFn(reset, 100, { immediate: false })
const cb = Tempus.add(
  () => {
    if (!$dot.value) return
    const x = lerp(position.x, $store.pinState.x, 0.75)
    const y = lerp(position.y, $store.pinState.y, 0.75)

    position.x = x
    position.y = y
    $dot.value.style.transform = `translate(${x}px, ${y}px)`

    $store.particleState.x = x
    $store.particleState.y = y

    velocity.x = x - prev.x
    velocity.y = y - prev.y
    prev.x = x
    prev.y = y

    if ($store.isIpad) {
      $store.pinState.x = x
      $store.pinState.y = y
      $store.pinState.nx = x / window.innerWidth
      $store.pinState.ny = y / window.innerHeight
    }

    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    if ($dotSvg.value) {
      // ── Rotation ──────────────────────────────────
      if (speed > 0.0005) {
        const targetAngle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
        let delta = targetAngle - currentAngle
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        currentAngle += delta * 0.12
      }

      // ── Warp / squash-and-stretch ─────────────────
      // Map speed to a stretch factor (clamp so it doesn't go insane)
      const stretch = Math.min(speed * 80, 0.15) // 0 → 0.5 max elongation
      const targetScaleX = 1 + stretch
      const targetScaleY = 1 / (1 + stretch) // volume-preserving squash

      // Lerp toward target for smooth ease-in/out
      currentScaleX = lerp(currentScaleX, targetScaleX, 0.18)
      currentScaleY = lerp(currentScaleY, targetScaleY, 0.18)

      // Combine rotation + warp in one transform
      // The scale is applied in LOCAL space (along movement axis = X after rotation)
      $dotSvg.value.style.transform = `rotate(${currentAngle}deg) scaleX(${currentScaleX}) scaleY(${currentScaleY})`
      $store.particleState.rotation = currentAngle
    }
  },

  { priority: -1 }
)

watch(
  () => $store.isJogwheel,
  (v) => {
    if (v) {
      if (!$dot.value) return

      $store.isActive = true
      $dot.value.classList.add('is-active')
      stop()
      start()
    } else {
      if (!$dot.value) return
      $store.isActive = false
      $dot.value.classList.remove('is-active')
    }
  }
)

watch(
  () => $store.midiData[2].value,
  () => {
    if (!$dot.value) return
    if ($store.isIpad) return
    $store.isActive = true
    $dot.value.classList.add('is-active')
    stop()
    start()
  }
)

watch(
  () => $store.midiData[3].value,
  () => {
    if (!$dot.value) return
    if ($store.isIpad) return
    $store.isActive = true
    $dot.value.classList.add('is-active')
    stop()
    start()
  }
)

watch(
  () => $store.pinState,
  () => {}
)

tryOnMounted(() => {
  initialize()
})

tryOnBeforeUnmount(() => {
  cb?.()
})
</script>

<style lang="scss" scoped>
.sound {
  position: fixed;
  inset: 0;
  z-index: 9999;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &__content {
    > div {
      position: absolute;
      font-size: 20px;
      text-shadow: 0 4px 10px 0 #0087c166;
      padding: 64px;
      white-space: nowrap;

      &:nth-child(1) {
        top: 0;
        left: 0;
        transform: translate(-80px, -80px);
      }
      &:nth-child(2) {
        top: 0;
        right: 0;
        transform: translate(80px, -80px);
      }
      &:nth-child(3) {
        bottom: 0;
        left: 0;
        transform: translate(-80px, 80px);
      }
      &:nth-child(4) {
        bottom: 0;
        right: 0;
        transform: translate(80px, 80px);
      }
    }
  }
}

#dot {
  --size: 24px;
  position: absolute;
  width: var(--size);
  height: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s linear;

  &.is-ipad {
    width: 12px;
    height: 12px;
    backdrop-filter: blur(2px) saturate(1.2);
    -webkit-backdrop-filter: blur(2px) saturate(1.2);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(64, 237, 253, 0.1) 100%);
    transition: all 0.1s linear;
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
    opacity: 0;
    mix-blend-mode: lighten;
  }

  &.is-active {
    --size: 36px;

    &.is-ipad {
      width: 24px !important;
      height: 24px !important;
      opacity: 1 !important;
    }

    #dot--svg {
      opacity: 1;
      transform: scale(1);
    }

    .dot__svg {
      opacity: 1;
    }
  }

  &--svg {
    position: absolute;
    width: 440px;
    height: 440px;
    display: flex;
    align-items: center;
    justify-content: center;
    // Ensure the ellipse image renders BELOW the glass layer
    z-index: 0;
    transition: all 0.15s ease-out;
    opacity: 0;
    transform: scale(0.5);

    img {
      position: absolute;
      width: 100%;
      height: auto;
      // No blur here — keep it crisp
      filter: none;

      &.ellipse {
        transform: scale(1) translate(-19%, 0%);
        opacity: 0.8;
      }

      &.bloom {
        transform: scale(1) translate(5%, -10%);
        opacity: 0.6;
      }
    }
  }

  // ── Glass blur layer (pseudo, not SVG) ───────────
  // This sits between the image and the SVG orb
  &::before {
    content: '';
    position: absolute;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    z-index: 1;

    // Clip to circle so it doesn't bleed outside
    clip-path: circle(50% at 50% 50%);
  }

  // ── SVG orb ──────────────────────────────────────
  .dot__svg {
    position: relative;
    z-index: 2; // above the blur layer
    width: 100%;
    height: 100%;
    overflow: visible;

    // TODO
    opacity: 1;

    // NO backdrop-filter here anymore — handled by ::before
    // Only keep the drop-shadow
    filter: drop-shadow(0 4px 16px rgba(0, 135, 193, 0.45))
      drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));

    transition: all 0.45s ease-out;

    .dot__bloom {
      transition: opacity 0.4s ease;
    }
  }

  // ── Ripple rings ─────────────────────────────────
  .dot__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(0, 200, 255, 0.5);
    opacity: 0;
    pointer-events: none;
    z-index: 3;
  }

  // ── Active state ─────────────────────────────────
  &.is-active {
    .dot__svg {
      filter: drop-shadow(0 4px 24px rgba(0, 195, 255, 0.65))
        drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));

      .dot__bloom {
        opacity: 0;
      }

      ellipse:first-of-type {
        animation: specular-drift 2.5s ease-in-out infinite;
      }
    }

    .dot__ring--1 {
      animation: ring-expand 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
    }
    .dot__ring--2 {
      animation: ring-expand 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) 0.25s forwards;
    }
  }
}
</style>
