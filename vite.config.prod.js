// vite.config.prod.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sro-noso-webapp/',
  plugins: [react()],
})
