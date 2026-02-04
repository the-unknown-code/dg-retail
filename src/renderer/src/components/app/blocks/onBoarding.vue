<template>
  <div class="onboarding">
    <div class="onboarding__content">
      <p>mix YOUR personal light blue SOUND WAVE BY playing with THE dj console</p>
      <p>امزج موجتك الصوتية الزرقاء الفاتحة الخاصة عن طريق اللعب بجهاز الدي جي</p>
    </div>
    <div class="onboarding__footer">
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
import { tryOnBeforeUnmount, tryOnMounted } from '@vueuse/core'
import gsap from 'gsap/all'
import { ref } from 'vue'
import Fader from '@renderer/components/ui/fader.vue'
import Jogwheel from '@renderer/components/ui/jogwheel.vue'

const $jogwheelL = ref<HTMLDivElement>()
const $fader = ref<HTMLDivElement>()
const $jogwheelR = ref<HTMLDivElement>()

const initialize = (): void => {
  if (!$jogwheelL.value || !$fader.value || !$jogwheelR.value) return

  gsap.to([$jogwheelL.value, $fader.value, $jogwheelR.value], {
    duration: 2,
    ease: 'power2.inOut',
    y: 0,
    rotate: 0,
    opacity: 1,
    stagger: {
      from: 'center',
      amount: 0.25
    }
  })
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;

  &__content {
    position: relative;
    width: 438px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--app-gap);
    text-align: center;
  }

  &__footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--app-gap);

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
