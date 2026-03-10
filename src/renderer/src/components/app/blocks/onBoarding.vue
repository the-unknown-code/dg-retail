<template>
  <div class="onboarding">
    <div ref="$intro" class="onboarding__intro">
      <animated-text text="WHAT'S YOUR MOOD OF THE DAY?" />
    </div>
    <div ref="$content" class="onboarding__content">
      <animated-text
        text="FEEL YOUR VIBE AND PLAY WITH THE DJ CONSOLE TO DISCOVER YOUR LIGHT BLUE PLAYLIST"
        :delay="1"
      />
    </div>
    <div ref="$footer" class="onboarding__footer">
      <dic class="console">
        <div ref="$jogwheelL">
          <Jogwheel />
        </div>
        <div ref="$fader">
          <Fader />
        </div>
        <div ref="$jogwheelR">
          <Jogwheel />
        </div>
      </dic>
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
const $jogwheelL = ref<HTMLDivElement>()
const $fader = ref<HTMLDivElement>()
const $jogwheelR = ref<HTMLDivElement>()

const $intro = ref<HTMLDivElement>()
const $content = ref<HTMLDivElement>()
const $footer = ref<HTMLDivElement>()

const timeline = gsap.timeline({ delay: 2.5 })

const initialize = (): void => {
  if (!$jogwheelL.value || !$fader.value || !$jogwheelR.value) return
  if (!$intro.value || !$content.value || !$footer.value) return

  timeline.to($intro.value, {
    duration: 2,
    ease: 'power2.inOut',
    opacity: 0
  })

  timeline.to(
    [$content.value, $footer.value],
    {
      duration: 2,
      ease: 'power2.inOut',
      opacity: 1,
      onStart: () => {
        const $rect = $fader.value?.querySelector('rect')
        gsap.set($rect as unknown as HTMLDivElement, {
          y: 40
        })

        gsap.to($rect as unknown as HTMLDivElement, {
          delay: 1,
          duration: 3.5,
          ease: 'power2.inOut',
          y: -40,
          repeat: 1,
          yoyo: true
        })

        gsap.to([$jogwheelL.value, $jogwheelR.value], {
          duration: 4.5,
          ease: 'power2.inOut',
          rotate: 0,
          repeat: 1,
          yoyo: true
        })

        gsap.to([$jogwheelL.value, $fader.value, $jogwheelR.value], {
          duration: 2,
          ease: 'power2.inOut',
          y: 0,
          opacity: 1,
          stagger: {
            from: 'center',
            amount: 0.25
          },
          onComplete: () => {
            setTimeout(() => {
              $store.appState = APP_STATE.MIXING
            }, 3500)
          }
        })
      }
    },
    '-=1'
  )
}

tryOnMounted(() => {
  initialize()
})

tryOnBeforeUnmount(() => {
  gsap.killTweensOf([$jogwheelL.value, $fader.value, $jogwheelR.value])
})
</script>

<style lang="scss" scoped>
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

  &__intro {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &:deep(p) {
      font-size: 32px;
      max-width: 320px;
      text-align: center;
    }
  }

  &__content {
    position: relative;
    width: 438px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--app-gap);
    text-align: center;
    transform: translateY(-100%);
    opacity: 0;
  }

  &__footer {
    position: absolute;
    bottom: 110px;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--app-gap);
    opacity: 0;

    .console {
      position: relative;
      width: 795px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--app-gap);

      > div {
        position: relative;
        transform: translateY(100%);
        opacity: 0;

        &:nth-child(1) {
          transform: translateY(100%) rotate(-60deg);
        }

        &:nth-child(3) {
          transform: translateY(100%) rotate(60deg);
        }
      }

      &:deep(.ui-jogwheel) {
        width: 240px;
        height: auto;
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
