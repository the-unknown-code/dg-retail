<template>
  <div class="start">
    <div ref="$circle" class="circle"></div>
    <button>
      <img src="/assets/button.webp" alt="start" draggable="false" />
      <p>Start</p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { random } from '@renderer/libs/@math'
import gsap from 'gsap/all'
import { ref, onMounted } from 'vue'

const canDraw = ref(true)
const $circle = ref<HTMLDivElement>()

const drawCircle = (): void => {
  if (!$circle.value || !canDraw.value) return

  const $circleItem = document.createElement('div')
  $circleItem.classList.add('circle--item')

  $circle.value.appendChild($circleItem)

  const duration = random(4, 5)

  gsap.to($circleItem, {
    duration,
    ease: 'power2.in',
    width: '100%',
    opacity: 1,
    backgroundColor: 'rgba(255, 255, 255, 0)'
  })

  gsap.to($circleItem, {
    duration: duration / 2,
    delay: duration / 2,
    ease: 'power2.inOut',
    border: '1px solid rgba(255, 255, 255, 0)',
    onComplete: () => {
      gsap.killTweensOf($circleItem)
      $circleItem.remove()
    }
  })

  setTimeout(
    () => {
      drawCircle()
    },
    random(1, duration / 3) * 1000
  )
}

const initialize = (): void => {
  drawCircle()
}

onMounted(() => {
  initialize()
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

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    p {
      position: relative;
      text-transform: uppercase;
      font-size: 22px;
      text-shadow: 0 0 60px rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
