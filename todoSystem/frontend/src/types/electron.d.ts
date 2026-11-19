// Electron preload 通过 contextBridge 注入到 window 的对象类型声明
// 在 web 端这个对象不存在，代码里用可选链/判断做兼容
export interface ElectronAPI {
  isElectron: boolean
  apiBaseUrl: string
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
