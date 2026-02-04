<template>
  <div class="ui-fader">
    <svg
      width="169"
      height="215"
      viewBox="0 0 169 215"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_197_193)">
        <g filter="url(#filter1_d_197_193)">
          <rect
            x="42"
            y="85.4099"
            width="85"
            height="33.1801"
            rx="16.5901"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            shape-rendering="crispEdges"
          />
        </g>
        <path d="M87 189H83V120H87V189Z" fill="white" />
        <g filter="url(#filter2_d_197_193)">
          <path
            d="M90 187C91.1046 187 92 187.895 92 189C92 190.105 91.1046 191 90 191H80C78.8954 191 78 190.105 78 189C78 187.895 78.8954 187 80 187H90Z"
            fill="white"
          />
        </g>
        <g filter="url(#filter3_d_197_193)">
          <path
            d="M90 20C91.1046 20 92 19.1046 92 18C92 16.8954 91.1046 16 90 16H80C78.8954 16 78 16.8954 78 18C78 19.1046 78.8954 20 80 20H90Z"
            fill="white"
          />
        </g>
        <path d="M87 18H83V87H87V18Z" fill="white" />
      </g>
      <defs>
        <filter
          id="filter0_d_197_193"
          x="20"
          y="-1"
          width="129"
          height="216"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <!--
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          -->
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.298039 0 0 0 0 0.72549 0 0 0 0 0.909804 0 0 0 0.4 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_197_193" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_197_193"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_197_193"
          x="0"
          y="47.4099"
          width="169"
          height="117.18"
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
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="20" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.298039 0 0 0 0 0.72549 0 0 0 0 0.909804 0 0 0 1 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_197_193" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_197_193"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_197_193"
          x="68"
          y="177"
          width="34"
          height="24"
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
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.298039 0 0 0 0 0.72549 0 0 0 0 0.909804 0 0 0 0.3 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_197_193" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_197_193"
            result="shape"
          />
        </filter>
        <filter
          id="filter3_d_197_193"
          x="68"
          y="6"
          width="34"
          height="24"
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
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.298039 0 0 0 0 0.72549 0 0 0 0 0.909804 0 0 0 0.3 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_197_193" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_197_193"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ui-fader {
  position: relative;
  width: 100%;
  height: auto;

  svg {
    width: 100%;
  }
}
</style>
