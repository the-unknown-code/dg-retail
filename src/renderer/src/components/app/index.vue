<template>
  <div class="app">
    <Header />
    <Start :callback="onStart" />
  </div>
</template>

<script setup lang="ts">
import Header from './blocks/header.vue'
import Start from './blocks/start.vue'

const onStart = (): void => {
  console.log('start')
}
</script>

<style lang="scss" scoped>
.app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  padding: var(--app-padding);
  display: flex;
  flex-direction: column;
  gap: 32px;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, #faf3e9 50%, var(--blue) 100%);
    opacity: 0.5;
    z-index: -1;
  }
}
</style>
