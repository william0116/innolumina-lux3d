import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

// GitHub Pages 项目子路径：CI 构建时通过 VITE_BASE_PATH 注入；本地开发默认为根路径
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
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
