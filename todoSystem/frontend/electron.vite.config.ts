import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Electron 专用配置：与 web 的 vite.config.ts 完全独立，互不干扰
// electron-vite 会分别构建 main / preload / renderer 三个部分
const mainEntry = fileURLToPath(new URL('./electron/main.ts', import.meta.url))
const preloadEntry = fileURLToPath(new URL('./electron/preload.ts', import.meta.url))

export default defineConfig({
  // 主进程：把 electron 等依赖排除在打包外，由 Electron 运行时提供
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { input: mainEntry },
    },
  },
  // 预加载脚本
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { input: preloadEntry },
    },
  },
  // 渲染进程：就是现有的 React 应用（项目根有 index.html，源码在 src/）
  renderer: {
    root: fileURLToPath(new URL('.', import.meta.url)),
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    // 打包后 index.html 通过 file:// 加载，资源必须用相对路径而不是 /assets
    base: './',
    build: {
      outDir: 'out/renderer',
      emptyOutDir: true,
      rollupOptions: {
        input: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
  },
})
