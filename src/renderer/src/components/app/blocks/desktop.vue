<template>
  <div class="qr-code">
    <circles :callback="() => {}" />

    <div ref="$svg" class="qr-code__svg">
      <img src="/assets/qr-code.png" alt="QR Code" />
      <div id="qr-svg">
        <QrCode simple />
      </div>

      <svg
        width="175"
        height="175"
        viewBox="0 0 175 175"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="171" height="171" rx="27.5" stroke="white" />
        <path
          ref="$path"
          d="M87.5 1.5 H145.5 C160.964 1.5 173.5 14.036 173.5 29.5 V145.5 C173.5 160.964 160.964 173.5 145.5 173.5 H29.5 C14.036 173.5 1.5 160.964 1.5 145.5 V29.5 C1.5 14.036 14.036 1.5 29.5 1.5 H87.5 Z"
          stroke="#00A6E9"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div class="qr-code__footer text">
      <div class="p">
        <span>This experience is available only on mobile.<br />Scan the QR code to play.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Circles from '@renderer/components/ui/circles.vue'
import QrCode from '@renderer/components/ui/qr-code.vue'
</script>

<style lang="scss" scoped>
.circle {
  position: absolute;
  inset: 0; // replaces top/left/width/height
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
    background-color: #ffffff22;
    transform-origin: center;
    will-change: transform, opacity;
  }
}

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
  z-index: 999;

  &__white {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 100;
    pointer-events: none;
    opacity: 0;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, var(--blue) 0%, black 200%);
    opacity: 0;
    z-index: 99;
    pointer-events: none;
  }

  &__svg {
    position: relative;
    width: 175px;
    height: 175px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;

    #qr-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 65%;
      height: 65%;
      z-index: 100;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

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

  div.text {
    text-align: center;
    font-size: 22px;
    max-width: 483px;
    text-wrap: balance;

    &:deep(p) {
      font-size: 22px;
    }

    &.big {
      &:deep(p) {
        font-size: 32px;
      }
    }
  }
}
</style>
