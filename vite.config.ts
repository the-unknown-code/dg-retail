import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [
    glsl({
      include: ['**/*.glsl', '**/*.wgsl', '**/*.vert', '**/*.frag']
    })
  ],
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://oauth2.googleapis.com https://sheets.googleapis.com"
      ].join('; ')
    }
  }
})
