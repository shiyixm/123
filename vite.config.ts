import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/123/', // 强制使用真实的 GitHub 仓库名作为绝对路径
  plugins: [react()],
})
