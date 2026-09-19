import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg}']
      },
      manifest: {
        name: 'Nattilalert',
        short_name: 'Nattilalert',
        start_url: '/',
        display: 'standalone'
      }
    })
  ],
})