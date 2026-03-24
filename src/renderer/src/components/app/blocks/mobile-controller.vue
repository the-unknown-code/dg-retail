<template>
  <div class="ipad-controller">
    <div class="ipad-controller__background">
      <div class="sound" :style="{ '--height': `${height * 0.8}px` }">
        <p>VIBY</p>
        <p>PARTY</p>
        <p>CHILL</p>
        <p>JAZZY</p>
      </div>
      <div class="ipad-controller__background--mask" />
      <div class="ipad-controller__background--blur" :style="{ height: `${height * 1.1}px` }" />
      <svg
        width="375"
        height="393"
        viewBox="0 0 375 393"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_747_1514)">
          <path
            d="M0 72L375 72.0445V393L0 392.956V72Z"
            fill="url(#paint0_linear_747_1514)"
            fill-opacity="0.4"
            shape-rendering="crispEdges"
          />
          <path
            d="M0.0314405 24C0.936225 50.0834 21.9166 71.0638 48 71.9686V72H0V24H0.0314405Z"
            fill="url(#paint1_linear_747_1514)"
            fill-opacity="0.4"
            shape-rendering="crispEdges"
          />
          <path
            d="M374.969 24C374.064 50.0834 353.083 71.0638 327 71.9686V72H375V24H374.969Z"
            fill="url(#paint2_linear_747_1514)"
            fill-opacity="0.4"
            shape-rendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_747_1514"
            x="-20"
            y="0"
            width="415"
            height="409"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="-4" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0.527804 0 0 0 0 0.75539 0 0 0 0.4 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_747_1514" />
            <feBlend
              mode="normal"
              in="BackgroundImageFix"
              in2="effect1_dropShadow_747_1514"
              result="BackgroundImageFix"
            />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_747_1514"
            x1="187.5"
            y1="24"
            x2="187.5"
            y2="393"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#4CB9E8" stop-opacity="0" />
            <stop offset="1" stop-color="#4CB9E8" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_747_1514"
            x1="187.5"
            y1="24"
            x2="187.5"
            y2="393"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#4CB9E8" stop-opacity="0" />
            <stop offset="1" stop-color="#4CB9E8" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_747_1514"
            x1="187.5"
            y1="24"
            x2="187.5"
            y2="393"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#4CB9E8" stop-opacity="0" />
            <stop offset="1" stop-color="#4CB9E8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="ipad-controller__ui">
      <div>
        <Jogwheel id="2" />
        <Fader />
        <Jogwheel id="3" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import Jogwheel from '../../ui/jogwheel.vue'
import Fader from '../../ui/fader.vue'

const $svg = ref<HTMLDivElement | null>(null)
const { height } = useElementSize($svg)
</script>

<style lang="scss" scoped>
.ipad-controller {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5000;
  display: flex;
  align-items: flex-end;

  &__ui {
    position: relative;
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;

    transform: translateY(-67%);

    > div {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:deep(.ui-jogwheel),
      &:deep(.ui-fader) {
        width: auto;

        svg {
          position: relative;
          width: 100%;
          height: auto;
          display: block;
        }
      }

      &:deep(.ui-jogwheel) {
        position: relative;
        width: 420px;
        aspect-ratio: 1;
        transform: translateX(-30%) scale(1.5);

        &:nth-child(3) {
          transform: translateX(30%) scale(1.5);
        }
      }

      &:deep(.ui-fader) {
        position: relative;
        width: 270px;
        aspect-ratio: 1;
      }
    }
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    pointer-events: none;

    &--blur {
      position: absolute !important;
      bottom: 0 !important;
      left: 0;
      width: 100%;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);

      // This masks the blur to fade bottom→top
      -webkit-mask-image: linear-gradient(to top, black 30%, transparent 100%);
      mask-image: linear-gradient(to top, black 30%, transparent 100%);
    }

    &--mask {
      display: none;
      position: absolute !important;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 320px !important;
      background: linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, transparent 100%);
      z-index: 1;
    }

    > div.sound {
      position: relative;
      width: 100%;
      height: calc(100% - var(--height));
      color: white;
      display: none !important;

      p {
        position: absolute;
        font-size: 20px;
        text-shadow: 0px 4px 10px 0px #0087c166;
        padding: 32px 48px;

        &:nth-child(1) {
          top: 0%;
          left: 0%;
        }
        &:nth-child(2) {
          top: 0%;
          right: 0%;
        }
        &:nth-child(3) {
          bottom: 0%;
          left: 0%;
        }
        &:nth-child(4) {
          bottom: 0%;
          right: 0%;
        }
      }
    }
  }

  svg {
    position: absolute;
    display: block;
    bottom: 0;
    left: 0;
    width: 100%;
    height: auto;
    max-width: 100vw;

    path {
      fill: var(--white);
      fill-opacity: 0.2;
    }
  }
}
</style>
