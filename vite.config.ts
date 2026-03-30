import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 解决 GitHub Pages 构建后的绝对路径 404 找不到 asset 的问题
  plugins: [react()],
})
