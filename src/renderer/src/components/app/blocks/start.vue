<template>
  <div class="start">
    <circles :callback="callback" />

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
      <animated-text :key="activeLanguage" :text="TEXTS[activeLanguage]" :speed="0.5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ref, watch } from 'vue'
import AnimatedText from '@renderer/components/ui/animated-text.vue'
import { tryOnMounted } from '@vueuse/core'
import { useAppStore } from '@renderer/store'
import Circles from '@renderer/components/ui/circles.vue'

defineProps<{
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

const TEXTS = [
  'SELECT YOUR LANGUAGE AND PRESS START', // English
  'SELEZIONA LA TUA LINGUA E PREMI START', // Italiano
  'WÄHLEN SIE IHRE SPRACHE UND DRÜCKEN SIE START', // Deutsch
  'SELECCIONA TU IDIOMA Y PULSA INICIAR', // Español
  'اختر لغتك واضغط ابدأ', // Arabic
  'SÉLECTIONNEZ VOTRE LANGUE ET APPUYEZ SUR START', // Français
  'SELECIONE O SEU IDIOMA E PRESSIONE INICIAR', // Português
  '选择您的语言，然后按开始', // Chinese (Simplified)
  '言語を選択してスタートを押してください' // Japanese
]

const $store = useAppStore()
const canChange = ref(true)

const CENTER = 64
const DEADZONE = 4

const handleJogwheel = (value: number): void => {
  if (!canChange.value) return
  if (Math.abs(value - CENTER) <= DEADZONE) return

  if (value > CENTER + DEADZONE) {
    activeLanguage.value = (activeLanguage.value + 1) % LANGUAGES.length
  } else {
    activeLanguage.value = (activeLanguage.value - 1 + LANGUAGES.length) % LANGUAGES.length
  }

  canChange.value = false
  setTimeout(() => (canChange.value = true), 400)
}

watch(() => $store.midiData[2].value, handleJogwheel)
watch(() => $store.midiData[3].value, handleJogwheel)

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
