import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    build: {
      minify: true
    }
  },
  preload: {
    build: {
      minify: true
    }
  },
  renderer: {
    define: {
      __IS_MOBILE_BUILD__: false
    },
    server: {
      host: '0.0.0.0',
      port: 5173
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: true,
        mangle: true,
        format: {
          comments: false
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
            tone: ['tone']
          }
        }
      }
    }
  }
})
