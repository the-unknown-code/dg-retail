<template>
  <div class="sound">
    <div v-if="!$store.isIpad" class="sound__content">
      <p>VIBY</p>
      <p>PARTY</p>
      <p>CHILL</p>
      <p>JAZZY</p>
    </div>

    <div id="dot" ref="$dot">
      <div ref="$dotSvg" id="dot--svg">
        <img class="bloom" src="/assets/bloom.png" />
        <img class="ellipse" src="/assets/ellipse.png" />
      </div>

      <!-- SVG Glass Orb -->
      <svg class="dot__svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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

          <!-- Radial gradients -->
          <radialGradient id="glass-body" cx="38%" cy="30%" r="105%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
            <stop offset="30%" stop-color="#c8eeff" stop-opacity="0.18" />
            <stop offset="65%" stop-color="#0087c1" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#001a2e" stop-opacity="0.25" />
          </radialGradient>

          <radialGradient id="rim-light" cx="49%" cy="49%" r="50%">
            <stop offset="72%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="92%" stop-color="#7de0ff" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.6" />
          </radialGradient>

          <linearGradient id="edge-shine" x1="0%" y1="0%" x2="100%" y2="20%">
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
import { tryOnBeforeUnmount, useTimeoutFn } from '@vueuse/core'
import Tempus from 'tempus'
import { lerp } from 'three/src/math/MathUtils.js'
import { ref, watch } from 'vue'

const $store = useAppStore()
const $dot = ref<HTMLDivElement | null>(null)
const $dotSvg = ref<HTMLDivElement | null>(null)

const reset = (): void => {
  if (!$dot.value) return
  $dot.value.classList.remove('is-active')
}

const position = { ...$store.pinState }
const velocity = { x: 0, y: 0 }
const prev = { x: $store.pinState.x, y: $store.pinState.y }
let currentAngle = 0

const { start, stop } = useTimeoutFn(reset, 100, { immediate: false })
const cb = Tempus.add(
  () => {
    if (!$dot.value) return
    const x = lerp(position.x, $store.pinState.x, 0.5)
    const y = lerp(position.y, $store.pinState.y, 0.5)

    position.x = x
    position.y = y
    $dot.value.style.transform = `translate(${x}px, ${y}px)`

    velocity.x = x - prev.x
    velocity.y = y - prev.y
    prev.x = x
    prev.y = y

    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    if (speed > 0.0005 && $dotSvg.value) {
      // atan2 gives angle in radians; y is inverted because screen-Y flips
      const targetAngle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)

      // Lerp angle (handle wrap-around)
      let delta = targetAngle - currentAngle
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360

      currentAngle += delta * 0.12
      $dotSvg.value.style.transform = `rotate(${currentAngle}deg)`
    }
  },

  { priority: -1 }
)

watch(
  () => $store.midiData[2].value,
  () => {
    if (!$dot.value) return
    $dot.value.classList.add('is-active')
    stop()
    start()
  }
)

watch(
  () => $store.midiData[3].value,
  () => {
    if (!$dot.value) return
    $dot.value.classList.add('is-active')
    stop()
    start()
  }
)

watch(
  () => $store.pinState,
  () => {}
)

tryOnBeforeUnmount(() => {
  cb?.()
})
</script>

<style lang="scss" scoped>
@keyframes ring-expand {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes svg-breathe {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  33% {
    transform: scale(1.04) rotate(1.5deg);
  }
  66% {
    transform: scale(0.97) rotate(-1deg);
  }
}

@keyframes specular-drift {
  0%,
  100% {
    opacity: 0.75;
    transform: rotate(-25deg) translate(0, 0);
  }
  50% {
    opacity: 0.9;
    transform: rotate(-20deg) translate(1px, -1px);
  }
}

.sound {
  position: fixed;
  inset: 0;
  z-index: 9999;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  mix-blend-mode: lighten;
  pointer-events: none;

  p {
    position: absolute;
    font-size: 20px;
    text-shadow: 0 4px 10px 0 #0087c166;
    padding: 64px;

    &:nth-child(1) {
      top: 0;
      left: 0;
    }
    &:nth-child(2) {
      top: 0;
      right: 0;
    }
    &:nth-child(3) {
      bottom: 0;
      left: 0;
    }
    &:nth-child(4) {
      bottom: 0;
      right: 0;
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
  mix-blend-mode: darken;
  isolation: isolate;
  transition: all 0.25s ease-out;

  &.is-active {
    --size: 48px;

    #dot--svg {
      opacity: 1;
      transform: scale(1);
    }
  }

  &--svg {
    position: absolute;
    width: 240px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    // Ensure the ellipse image renders BELOW the glass layer
    z-index: 0;
    transition: all 0.45s ease-out;
    opacity: 0;
    transform: scale(0.5);

    img {
      position: absolute;
      width: 100%;
      height: auto;
      // No blur here — keep it crisp
      filter: none;

      &.ellipse {
        transform: scale(2) translate(-19%, 0%);
        opacity: 0.8;
      }

      &.bloom {
        transform: scale(2) translate(5%, -10%);
        opacity: 0.8;
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
    opacity: 1;

    // NO backdrop-filter here anymore — handled by ::before
    // Only keep the drop-shadow
    filter: drop-shadow(0 4px 16px rgba(0, 135, 193, 0.45))
      drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));

    transition: filter 0.45s ease-out;

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
