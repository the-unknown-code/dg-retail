import './assets/main.scss'

import Tempus from 'tempus'
import gsap from 'gsap'
import { createApp } from 'vue'
import emitter from './plugins/mitt'
import App from './App.vue'

gsap.defaults({ ease: 'none' })
gsap.ticker.remove(gsap.updateRoot)

Tempus?.add(
  (time) => {
    gsap.updateRoot(time / 1000)
  },
  { priority: 0 }
)

const app = createApp(App)
app.provide('emitter', emitter)
app.mount('#app')
