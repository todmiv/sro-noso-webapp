import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/sro-noso-webapp/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/functions': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/functions/, '/functions'),
        configure: (proxy: any, options: any) => {
          proxy.on('error', (err: any, req: any, res: any) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq: any, req: any, res: any) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
})
