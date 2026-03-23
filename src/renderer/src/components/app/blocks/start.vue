<template>
  <div class="start">
    <circles :callback="handleStart" />

    <div class="language">
      <div
        v-for="(language, index) in PARSED_LOCALES"
        ref="$languageItems"
        :key="language.id"
        :class="['language--item', { 'is-active': activeLanguage === index }]"
        @click="handleLanguageClick(language.id)"
      >
        <span>{{ language.label }}</span>
      </div>
    </div>

    <div class="info p">
      <animated-text
        :key="activeLanguage"
        :text="PARSED_LOCALES[activeLanguage].translations.language_selection"
        :speed="0.5"
      />
    </div>

    <div class="jogwheels">
      <div class="jogwheel-item">
        <Jogwheel animate />
      </div>
      <div class="jogwheel-item">
        <Jogwheel animate />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { ref, watch, computed } from 'vue'
import AnimatedText from '@renderer/components/ui/animated-text.vue'
import { tryOnMounted } from '@vueuse/core'
import { useAppStore } from '@renderer/store'
import Circles from '@renderer/components/ui/circles.vue'
import { LOCALES } from '@renderer/store/locale'
import Jogwheel from '@renderer/components/ui/jogwheel.vue'

const props = defineProps<{
  callback: () => void
  qrCode: boolean
}>()

const $store = useAppStore()

const PARSED_LOCALES = computed(() => {
  // Find the starting language
  const startingLanguage = $store.config.startingLanguage || LOCALES[0].id
  const startingIndex = LOCALES.findIndex((locale) => locale.id === startingLanguage)

  if (startingIndex === -1) return LOCALES

  // Move the starting language to the first position, maintaining original order for the rest
  return [
    LOCALES[startingIndex],
    ...LOCALES.slice(0, startingIndex),
    ...LOCALES.slice(startingIndex + 1)
  ]
})

const $languageItems = ref<HTMLDivElement[]>([])
const activeLanguage = ref($store.isIpad ? -1 : 0)
const currentLanguage = ref(PARSED_LOCALES.value[activeLanguage.value].id)

const canChange = ref(true)

const CENTER = 64
const DEADZONE = 4

const handleLanguageClick = (id: string): void => {
  $store.sessionData.language = id
  props.callback?.()
  setTimeout(() => {
    document.documentElement.lang = id
  }, 1000)
}

const handleStart = (): void => {
  handleLanguageClick(currentLanguage.value as string)
}

const handleJogwheel = (value: number): void => {
  if (!canChange.value) return
  if (Math.abs(value - CENTER) <= DEADZONE) return

  if (value > CENTER + DEADZONE) {
    activeLanguage.value = (activeLanguage.value + 1) % PARSED_LOCALES.value.length
    currentLanguage.value = PARSED_LOCALES.value[activeLanguage.value].id
  } else {
    activeLanguage.value =
      (activeLanguage.value - 1 + PARSED_LOCALES.value.length) % PARSED_LOCALES.value.length
    currentLanguage.value = PARSED_LOCALES.value[activeLanguage.value].id
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

.jogwheels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 220px;
  align-items: flex-end;
  flex-grow: 1;
  pointer-events: none;

  .jogwheel-item {
    position: relative;
    width: 400px;
    aspect-ratio: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: scale(1.43) translateY(35%);

    &:nth-child(2) {
      transform: scaleX(-1) scale(1.43) translateY(35%);
    }
  }
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
    bottom: 44px;
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
