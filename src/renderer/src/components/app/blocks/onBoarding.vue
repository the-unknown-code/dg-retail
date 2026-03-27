<template>
  <div class="onboarding">
    <div ref="$intro" class="onboarding__intro p default">
      <animated-text :key="keyIntro" :text="$store.getLocale('onboarding_01')" />
    </div>

    <div ref="$headphones" class="onboarding__content headphones p default">
      <animated-text :key="keyHeadphones" :text="$store.getLocale('onboarding_02_title')" />
      <div v-if="!$store.isMobile" class="icon">
        <img src="/assets/headphones.svg" class="headphones-pulse" />
        <div ref="$content" class="p">
          <animated-text :key="keyHeadphones" :text="$store.getLocale('onboarding_02_subtitle')" />
        </div>
      </div>
    </div>

    <div ref="$fader" class="onboarding__content fader p default">
      <animated-text :key="keyFader" :text="$store.getLocale('onboarding_03_title')" />
      <div>
        <Fader animate />
      </div>
    </div>

    <div ref="$jogwheels" class="onboarding__content jogwheels p default">
      <animated-text :key="keyJogwheels" :text="$store.getLocale('onboarding_04')" />
      <div class="console">
        <div>
          <Jogwheel animate />
        </div>
        <div>
          <Jogwheel animate />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap/all'
import { ref } from 'vue'
import AnimatedText from '@renderer/components/ui/animated-text.vue'
import Fader from '@renderer/components/ui/fader.vue'
import Jogwheel from '@renderer/components/ui/jogwheel.vue'
import { useAppStore } from '@renderer/store'
import { APP_STATE } from '@renderer/libs/@global/const'
import { tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core'

const $store = useAppStore()

const $intro = ref<HTMLDivElement>()
const $headphones = ref<HTMLDivElement>()
const $fader = ref<HTMLDivElement>()
const $jogwheels = ref<HTMLDivElement>()

const keyIntro = ref(0)
const keyHeadphones = ref(0)
const keyFader = ref(0)
const keyJogwheels = ref(0)
const timeline = gsap.timeline({ delay: 0.5 })

const initialize = (): void => {
  if (!$intro.value || !$headphones.value || !$fader.value || !$jogwheels.value) return

  /*
  timeline.to($intro.value, {
    opacity: 1,
    duration: 1,
    ease: 'power2.inOut'
  })
  */

  timeline.to($headphones.value, {
    opacity: 1,
    duration: 1,
    ease: 'power2.inOut',
    onStart: () => {
      keyHeadphones.value++
      if (!$intro.value) return
      gsap.to($intro.value, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })
    }
  })

  timeline.to($fader.value, {
    delay: 4.5,
    opacity: 1,
    duration: 1,
    ease: 'power2.inOut',
    onStart: () => {
      keyFader.value++
      if (!$headphones.value) return
      gsap.to($headphones.value, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })
    }
  })

  timeline.to($jogwheels.value, {
    delay: 4.5,
    opacity: 1,
    duration: 1,
    ease: 'power2.inOut',
    onStart: () => {
      keyJogwheels.value++
      if (!$fader.value) return
      gsap.to($fader.value, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })
    }
  })

  timeline.to($intro.value, {
    delay: 4.5,
    opacity: 1,
    duration: 1,
    ease: 'power2.inOut',
    onStart: () => {
      keyIntro.value++
      if (!$jogwheels.value) return
      gsap.to($jogwheels.value, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })
    },
    onComplete: () => {
      setTimeout(() => {
        $store.appState = APP_STATE.MIXING
      }, 3500)
    }
  })
}

tryOnMounted(() => {
  initialize()
})

tryOnBeforeUnmount(() => {})
</script>

<style lang="scss" scoped>
@keyframes headphones-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

.headphones-pulse {
  animation: headphones-pulse 2s infinite ease-in-out;
}

.onboarding {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  pointer-events: none;

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, var(--blue) 0%, black 200%);
    opacity: 0.7;
  }

  &__intro {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
  }

  .p {
    &:where(.is-mobile *) {
      text-align: center;

      br {
        display: none;
      }
    }
  }

  &__content {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--app-gap);
    text-align: center;
    opacity: 0;
    //  padding-top: 140px;

    .icon {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 64px;
      gap: 16px;
    }

    .console {
      position: relative;
      width: 795px;
      height: 280px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      > div {
        position: relative;
        opacity: 1;

        &:nth-child(2) {
          transform: scaleX(-1);
        }
      }

      &:deep(.ui-jogwheel) {
        width: 240px;
        height: auto;

        &:where(.is-mobile *) {
          width: 320px;
        }
      }

      &:deep(.ui-fader) {
        width: 121px;
        height: auto;
      }

      &:deep(svg) {
        width: 100%;
        height: auto;
      }
    }
  }
}
</style>
