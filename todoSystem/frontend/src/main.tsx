import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/router'
// import CSS 是 Vite 的能力：交给打包器处理，最终注入到页面
import '@/index.css'

// React 18 的入口写法：createRoot 接管 index.html 里的 #root 节点
// getElementById 后面的 ! 是 TypeScript 非空断言，表示「我确定它存在」
createRoot(document.getElementById('root')!).render(
  // StrictMode 只在开发环境生效：故意重复执行渲染和副作用，帮你提前发现写法问题
  <StrictMode>
    {/* BrowserRouter 使用 HTML5 history 模式管理路由（地址栏是 /login 而不是 /#/login）
        所有需要 useNavigate / Link 的组件都必须放在 Router 内部 */}
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)
