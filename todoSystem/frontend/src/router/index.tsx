import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { StudyProgressProvider } from '@/components/study/StudyProgressContext'
import { useAuthStore } from '@/stores/auth'
import { HomePage } from '@/views/HomePage'
import { LoginPage } from '@/views/LoginPage'
import { RegisterPage } from '@/views/RegisterPage'
import { StudyDayPage } from '@/views/study/StudyDayPage'
import { StudyFilmsPage } from '@/views/study/StudyFilmsPage'
import { StudyOverviewPage } from '@/views/study/StudyOverview'

// 路由守卫本质是一个组件：不直接渲染页面，而是根据条件决定渲染 children 还是跳转
// children: ReactNode 表示「任何可渲染的内容」，这样守卫包住什么页面都能复用
function Protected({ children }: { children: ReactNode }) {
  // selector 只订阅 token，token 不变时这个组件不重渲染
  const token = useAuthStore((state) => state.token)
  const location = useLocation() // 拿到当前地址，用于登录后跳回原页面
  if (!token) {
    // Navigate 是声明式跳转；replace 表示替换历史记录，用户点返回不会回到受限页
    // state 里带上 from，登录页可以读它实现「登录后回到原来想去的页面」
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</> // <></> 是 Fragment，不产生额外 DOM 节点
}

// 反向守卫：已登录的用户不该再看到登录/注册页，直接送回首页
function GuestOnly({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  if (token) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export function AppRouter() {
  return (
    // Routes 会从上到下匹配第一个符合条件的 Route；element 是要渲染的组件
    // 把页面用守卫组件包一层，就实现了「未登录不可访问」和「已登录不回登录页」
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/" element={<Protected><HomePage /></Protected>} />
      {/* 学习计划课程数据公开可读，游客也能浏览；进度为空，标记完成时才引导登录。
          Provider 包在外层，让侧栏与页面共享同一份进度状态 */}
      <Route path="/study" element={<StudyProgressProvider><StudyOverviewPage /></StudyProgressProvider>} />
      <Route path="/study/day/:day" element={<StudyProgressProvider><StudyDayPage /></StudyProgressProvider>} />
      <Route path="/study/films" element={<StudyProgressProvider><StudyFilmsPage /></StudyProgressProvider>} />
      {/* path="*" 是兜底路由，匹配所有未定义的地址，统一重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
