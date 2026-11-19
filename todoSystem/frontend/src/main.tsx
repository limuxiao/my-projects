import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppRouter } from '@/router'
// import CSS 是 Vite 的能力：交给打包器处理，最终注入到页面
import '@/index.css'

// web 端用 BrowserRouter（history 模式，地址栏 /login）
// Electron 用 HashRouter：file:// 下刷新子路径会 404，hash 路由（/#/login）不受影响
// web 端没有 window.electronAPI，所以仍走 BrowserRouter，行为不变
const Router = window.electronAPI?.isElectron ? HashRouter : BrowserRouter

// React 18 的入口写法：createRoot 接管 index.html 里的 #root 节点
// getElementById 后面的 ! 是 TypeScript 非空断言，表示「我确定它存在」
createRoot(document.getElementById('root')!).render(
  // StrictMode 只在开发环境生效：故意重复执行渲染和副作用，帮你提前发现写法问题
  <StrictMode>
    {/* Router 由运行环境决定；所有需要 useNavigate / Link 的组件必须放在 Router 内部 */}
    <Router>
      <AppRouter />
    </Router>
  </StrictMode>,
)
