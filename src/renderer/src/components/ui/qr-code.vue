<template>
  <div class="svg">
    <div ref="$qrSVG" />
  </div>
</template>

<script setup lang="ts">
import { QRCodeSVG } from '@akamfoad/qrcode'
import { useAppStore } from '@renderer/store'
import { tryOnMounted } from '@vueuse/core'
import { ref } from 'vue'

const $store = useAppStore()
const $qrSVG = ref<HTMLDivElement>()

const getDominantCorner = (corners: Record<string, number>): string => {
  const max = Math.max(...Object.values(corners))
  const topCorners = Object.entries(corners)
    .filter(([, count]) => count === max)
    .map(([corner]) => corner)

  return topCorners[Math.floor(Math.random() * topCorners.length)]
}

const getMood = (corner): string => {
  switch (corner) {
    case 'TL':
      return 'funky'
    case 'TR':
      return 'party'
    case 'BL':
      return 'chill'
    case 'BR':
      return 'groovy'
    default:
      return 'funky'
  }
}

const initialize = () => {
  if (!$qrSVG.value) return

  $store.sessionData.mood = getMood(getDominantCorner($store.corners))
  $store.sessionData.fader = $store.midiData[1].value

  const qrSVG = new QRCodeSVG(
    `https://dg-retail-landing.vercel.app/?lang=${$store.sessionData.language || 'en'}&mood=${$store.sessionData.mood}&fader=${$store.midiData[1].value}`,
    {
      level: 'Q',
      fgColor: '#00A6E9',
      image: {
        source: new URL('assets/icon.png', window.location.href).href,
        width: '30%',
        height: '30%',
        x: 'center',
        y: 'center'
      }
    }
  )

  $qrSVG.value.innerHTML = qrSVG.toString() ?? ''
}

tryOnMounted(() => {
  initialize()
})
</script>

<style lang="scss" scoped>
.svg {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
