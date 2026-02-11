<template>
  <main>
    <Three />
    <!--
    <App />
    -->
    <MidiDebug />
  </main>
</template>

<script setup lang="ts">
//import Versions from './components/Versions.vue'
import Three from './components/three/index.vue'
import MidiDebug from './components/app/debug/midi.vue'
import Midi from './libs/@midi'
// import App from './components/app/index.vue'
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

new Midi()
</script>

<style lang="scss" scoped>
main {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
