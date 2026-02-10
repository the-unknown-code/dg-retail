<script setup lang="ts">
//import Versions from './components/Versions.vue'
import Three from './components/three/index.vue'
// import App from './components/app/index.vue'
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <main>
    <Three />
    <!--
    <App />
    -->
  </main>
</template>

<style lang="scss" scoped>
main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
