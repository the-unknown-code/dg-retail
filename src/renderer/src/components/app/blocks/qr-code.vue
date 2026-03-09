<template>
  <div class="qr-code">
    <div class="qr-code__content">
      <p class="big">What a Vibe!</p>
    </div>

    <div class="qr-code__svg">
      <img src="/assets/qr-code.png" alt="QR Code" />
      <svg
        width="175"
        height="175"
        viewBox="0 0 175 175"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="171" height="171" rx="27.5" stroke="white" />
        <path
          d="M1.5 91.0789V145.5C1.5 160.964 14.036 173.5 29.5 173.5H145.5C160.964 173.5 173.5 160.964 173.5 145.5V29.5C173.5 14.036 160.964 1.5 145.5 1.5H94"
          stroke="#00A6E9"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <div class="qr-code__footer">
      <p>SCAN THE QR CODE TO REVEAL YOUR LIGHT BLUE PLAYLIST</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAppStore } from '@renderer/store'
import { tryOnMounted } from '@vueuse/core'

const $store = useAppStore()
watch(
  () => $store.midiData[60].input,
  () => {
    window.location.reload()
  }
)

tryOnMounted(() => {
  setTimeout(() => {
    window.location.reload()
  }, 5000)
})
</script>

<style lang="scss" scoped>
.qr-code {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 48px;

  &__svg {
    position: relative;
    width: 175px;
    height: 175px;
    display: flex;
    justify-content: center;
    align-items: center;

    img,
    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    img {
      transform: scale(1.6) translate(0%, 1.5%);
    }
  }

  p {
    text-align: center;
    font-size: 22px;
    max-width: 483px;
    text-wrap: balance;

    &.big {
      font-size: 32px;
    }
  }
}
</style>
