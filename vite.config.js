/**
 * @Author: Your name
 * @Date:   2025-12-26 11:55:16
 * @Last Modified by:   Your name
 * @Last Modified time: 2025-12-26 12:59:16
 */
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pinyin-converter/', // 替换为你的仓库名
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'pinyin-lib': ['pinyin-pro']
        }
      }
    }
  }
})