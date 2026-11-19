import { contextBridge } from 'electron'

// 通过 contextBridge 暴露一个只读标识，渲染进程据此判断自己运行在 Electron 中
// 前端代码用它切换 API 地址（绝对地址）和路由模式（hash）
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  // 后端地址：先用本机服务；后续改这里或改成从配置读取即可
  apiBaseUrl: 'http://localhost:3099/api',
})
