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
  },
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用源码映射以便调试
    sourcemap: false,
    // 配置Rollup选项
    rollupOptions: {
      output: {
        // 代码分割配置
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'd3': ['d3'],
          'mind-map': ['simple-mind-map']
        },
        // 限制chunk大小
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // 入口文件名称
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 静态资源文件名
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 设置chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})