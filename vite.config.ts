import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/sro-noso-webapp/' : '/',
  plugins: [react()],
})
