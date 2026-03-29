<template>
  <div class="start">
    <circles :callback="handleStart" />

    <div v-if="!$store.isMobile" class="language">
      <div
        v-for="(language, index) in PARSED_LOCALES"
        ref="$languageItems"
        :key="language.id"
        :class="[
          'language--item',
          { 'is-active': activeLanguage === index, 'is-ipad': $store.isIpad }
        ]"
        @click="handleLanguageClick(language.id)"
      >
        <span>{{ language.label }}</span>
      </div>
    </div>
    <div v-else class="start-btn" @click="handleLanguageClick('en')">
      <img src="/assets/start.png" alt="Start" />
    </div>

    <div class="info p">
      <animated-text
        :key="activeLanguage"
        :text="
          $store.isMobile
            ? PARSED_LOCALES[activeLanguage === -1 ? 0 : activeLanguage].translations
                .language_selection_mobile
            : $store.isIpad
              ? PARSED_LOCALES[activeLanguage].translations.language_selection_ipad
              : PARSED_LOCALES[activeLanguage].translations.language_selection
        "
        :speed="0.5"
      />
    </div>

    <div v-if="!$store.isIpad" class="jogwheels">
      <div class="jogwheel-item">
        <Jogwheel animate />
      </div>
      <div class="jogwheel-item">
        <Jogwheel animate />
      </div>
    </div>

    <div v-if="$store.isMobile" id="language">
      <p>{{ qLanguage }}</p>
      <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.77819 8.19239C6.38767 7.80186 6.38767 7.1687 6.77819 6.77817L13.2635 0.292969C13.6541 -0.0975555 14.2872 -0.0975555 14.6778 0.292969C15.0683 0.683493 15.0683 1.31666 14.6778 1.70718L8.19241 8.19239C7.80188 8.58291 7.16872 8.58291 6.77819 8.19239Z"
          fill="white"
        />
        <path
          d="M8.19241 8.19239C8.58293 7.80186 8.58293 7.1687 8.19241 6.77817L1.70711 0.292893C1.31658 -0.0976311 0.683418 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L6.77819 8.19239C7.16872 8.58291 7.80188 8.58291 8.19241 8.19239Z"
          fill="white"
        />
      </svg>
      <select @change="handleLanguageChange">
        <option v-for="locale in LOCALES" :key="locale.id" :value="locale.id">
          {{ locale.label }}
        </option>
      </select>
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

function getQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

const $store = useAppStore()
const qLanguage = getQueryParam('lang') || 'en'
const activeLanguage = ref($store.isIpad ? 0 : 0)

if ($store.isMobile) {
  activeLanguage.value = 0
}

const PARSED_LOCALES = computed(() => {
  // Find the starting language
  let startingLanguage = $store.config.startingLanguage || LOCALES[0].id
  if ($store.isIpad && !$store.isMobile) {
    startingLanguage = 'en'
  } else if ($store.isMobile) {
    startingLanguage = qLanguage
  }

  const startingIndex = LOCALES.findIndex((locale) => locale.id === startingLanguage)

  if (startingIndex === -1) return LOCALES

  // Move the starting language to the first position, maintaining original order for the rest
  return [
    LOCALES[startingIndex],
    ...LOCALES.slice(0, startingIndex),
    ...LOCALES.slice(startingIndex + 1)
  ]
})

const handleLanguageChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  const selectedLang = target.value

  // Update the URL with new "lang" param while keeping other params intact
  const url = new URL(window.location.href)
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', selectedLang)
  } else {
    url.searchParams.append('lang', selectedLang)
  }
  window.location.href = url.toString()
}

const $languageItems = ref<HTMLDivElement[]>([])

const currentLanguage = $store.isIpad
  ? ref('en')
  : ref(PARSED_LOCALES.value[activeLanguage.value].id)

const canChange = ref(true)

const CENTER = 64
const DEADZONE = 4

const handleLanguageClick = (id: string): void => {
  if (!$store.isMobile) {
    $store.sessionData.language = id
    props.callback?.()
    setTimeout(() => {
      document.documentElement.lang = id
    }, 1000)
  } else {
    props.callback?.()
    setTimeout(() => {
      $store.sessionData.language = qLanguage
      document.documentElement.lang = id
    }, 1000)
  }
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
#language {
  position: absolute;
  top: 24px;
  right: 24px;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000;
  gap: 8px;

  p {
    font-size: 14px;
  }

  select {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}

.svg-filters {
  position: fixed;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.start-btn {
  position: relative;
  z-index: 1000;

  img {
    width: 320px;
    height: 320px;
  }
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
        &:not(.is-ipad) {
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
