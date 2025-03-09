import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  base: '/mindfile_v3/',
  plugins: [
    vue({
      // 启用JSX支持
      jsx: true,
      // 启用响应式语法糖
      reactivityTransform: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8000,
    // 优化HMR性能
    hmr: {
      overlay: false, // 禁用错误覆盖层
      clientPort: 8000
    },
    // 启用预压缩，提高开发服务器性能
    force: true
  },
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 禁用源码映射以减少构建体积
    sourcemap: false,
    // 减小chunk大小警告阈值，更积极地分割代码
    chunkSizeWarningLimit: 800,
    // 启用最小化混淆
    minify: 'terser',
    // Terser配置
    terserOptions: {
      compress: {
        drop_console: true,  // 移除console
        drop_debugger: true // 移除debugger
      }
    },
    // 配置Rollup选项
    rollupOptions: {
      output: {
        // 更细粒度的代码分割配置
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 将大型UI库单独分割
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // 将图表库单独分割
            if (id.includes('echarts') || id.includes('d3')) {
              return 'charts'
            }
            // 将Vue相关库分组
            if (id.includes('vue') || id.includes('pinia') || id.includes('router')) {
              return 'vue-vendor'
            }
            // 其他第三方库
            return 'vendor'
          }
          // 将视图组件分组
          if (id.includes('/views/')) {
            return 'views'
          }
        },
        // 优化资源文件名，添加内容哈希以便更好的缓存
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    // 强制预构建这些依赖
    include: ['vue', 'vue-router', 'pinia', 'element-plus/es'],
    // 启用依赖项预构建
    force: true
  },
  // 启用预加载指令生成
  experimental: {
    renderBuiltUrl(filename) {
      return { type: 'asset', value: filename }
    }
  }
})