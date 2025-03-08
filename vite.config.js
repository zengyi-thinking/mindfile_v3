import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  base: '/mindfile_v3/',
  plugins: [
    vue({
      // 启用JSX支持
      jsx: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8000,
    hmr: {
      overlay: false // 禁用错误覆盖层
    }
  }
})