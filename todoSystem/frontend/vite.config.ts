import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // Vite 插件：@vitejs/plugin-react 提供 JSX 转换和 React 快速刷新（HMR）
  plugins: [react()],
  resolve: {
    // 路径别名：把 '@' 指向 src 目录，代码里就能写 import ... from '@/api/auth'
    // 用 fileURLToPath 把 URL 转成文件路径，是为了兼容不同操作系统
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // 监听所有网卡（0.0.0.0），这样局域网内其他设备可以通过本机 IP 访问
    host: '0.0.0.0',
    // 开发服务器代理：前端请求 /api/xxx 会被转发到后端 3099 端口
    // 这样前端只访问同源的 /api，避免浏览器跨域（CORS）问题
    proxy: {
      '/api': {
        target: 'http://localhost:3099',
        changeOrigin: true, // 转发时把请求头的 host 改成目标地址，后端看起来像同源请求
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀，/api/todos → /todos
      },
    },
  },
})
