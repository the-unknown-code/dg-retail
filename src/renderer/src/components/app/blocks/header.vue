<template>
  <div class="header">
    <img src="/assets/logo.webp" alt="logo" />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.header {
  position: absolute;
  top: var(--app-padding);
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 20vw;
    transform: translateY(-24%);
  }
}
</style>
