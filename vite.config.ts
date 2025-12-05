import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ command, mode }) => {
    // 根据当前 mode 加载对应的环境变量文件
    // VITE_ 前缀的变量才会被加载
    const env = loadEnv(mode, process.cwd(), 'VITE_')  // 配置不同环境的 proxy 或 API 基础路径
    const isDev = mode === 'development'
    const apiTarget = isDev
        ? env.VITE_API_BASE_URL || 'http://localhost:3000'
        : env.VITE_API_BASE_URL || 'https://api.example.com'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
      server: isDev
    ?{
      port: 5173,
      host: true,
      strictPort: true,
      proxy: {
        '/api/v1': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    }: undefined,// build 模式下不需要 dev server
      define: {
          // 全局 API 地址，方便在代码里直接使用
          __API_BASE__: JSON.stringify(apiTarget),
      },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
        },
      },
    },
  }
})