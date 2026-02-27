<template>
  <div class="sound">
    <div class="sound__content">
      <p>VIBY</p>
      <p>PARTY</p>
      <p>CHILL</p>
      <p>JAZZY</p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.sound {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: white;

  p {
    position: absolute;
    font-size: 20px;
    text-shadow: 0px 4px 10px 0px #0087c166;
    padding: 32px;

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
</style>
