<template>
  <div class="app">
    <Header />
    <Start />
  </div>
</template>

<script setup lang="ts">
import Header from './blocks/header.vue'
import Start from './blocks/start.vue'
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
}
</style>
