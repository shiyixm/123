import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/google-billing-demo/', // 强制使用 GitHub Pages 的绝对路径
  plugins: [react()],
})
