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
        ref="$svg"
        class="controller"
        width="1376"
        height="437"
        viewBox="0 0 1376 437"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_230_502)">
          <path
            d="M0 106H1376V442H0V106Z"
            fill="url(#paint0_linear_230_502)"
            fill-opacity="1"
            shape-rendering="crispEdges"
          />
          <path
            d="M1375.97 24C1375.96 24 1375.95 24.0118 1375.95 24.0265C1374.39 68.5644 1338.56 104.387 1294.03 105.945C1294.01 105.946 1294 105.958 1294 105.973C1294 105.988 1294.01 106 1294.03 106H1376V24.0273C1376 24.0122 1375.99 24 1375.97 24Z"
            fill="url(#paint1_linear_230_502)"
            fill-opacity="1"
            shape-rendering="crispEdges"
          />
          <path
            d="M0.0273211 24C0.0420415 24 0.0541198 24.0118 0.0546346 24.0265C1.61329 68.5644 37.4356 104.387 81.9735 105.945C81.9882 105.946 82 105.958 82 105.973C82 105.988 81.9878 106 81.9727 106H0V24.0273C0 24.0122 0.0122321 24 0.0273211 24Z"
            fill="url(#paint2_linear_230_502)"
            fill-opacity="1"
            shape-rendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_230_502"
            x="-20"
            y="0"
            width="1416"
            height="458"
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
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_230_502" />
            <feBlend
              mode="normal"
              in="BackgroundImageFix"
              in2="effect1_dropShadow_230_502"
              result="BackgroundImageFix"
            />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_230_502"
            x1="688"
            y1="24"
            x2="688"
            y2="442"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#4CB9E8" stop-opacity="0" />
            <stop offset="1" stop-color="#4CB9E8" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_230_502"
            x1="688"
            y1="24"
            x2="688"
            y2="442"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#4CB9E8" stop-opacity="0" />
            <stop offset="1" stop-color="#4CB9E8" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_230_502"
            x1="688"
            y1="24"
            x2="688"
            y2="442"
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
    width: calc(100% - 256px);
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;

    transform: translateY(40%);

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
      }

      &:deep(.ui-fader) {
        position: relative;
        width: 121px;
        aspect-ratio: 1;
        transform: translateY(-50%);
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
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);

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
      fill: #ffffff22;
    }
  }
}
</style>
