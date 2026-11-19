import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'

// 渲染进程构建产物目录（electron-vite 默认输出到 out/renderer）
const rendererDist = join(__dirname, '../out/renderer')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'TodoSystem',
    webPreferences: {
      // preload 在渲染页面前运行，用来安全地暴露少量 API 给前端
      // electron-vite 6 的 preload 产物后缀是 .mjs
      preload: join(__dirname, '../preload/preload.mjs'),
      // 安全基线：关闭 Node 集成、开启上下文隔离
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // 开发模式加载 electron-vite 的渲染进程开发服务器，生产模式加载本地文件
  // process.env.ELECTRON_RENDERER_URL 由 electron-vite dev 自动注入
  if (process.env.NODE_ENV === 'development' && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(rendererDist, 'index.html'))
  }

  // 外部的 http(s) 链接用系统默认浏览器打开，不在应用内跳转
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  // macOS 上点击 dock 图标且没有窗口时，重新创建一个
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除 macOS 外，关闭所有窗口即退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
