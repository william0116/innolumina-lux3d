import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      '/api/lux3d': {
        target: 'https://api.aholo.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lux3d/, '/global/lux3d/v1'),
      },
    },
  },
})
