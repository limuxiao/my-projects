import { useState, type ReactNode } from 'react'
import { ArrowLeft, LogOut, Menu } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useStudyProgressContext } from './StudyProgressContext'
import { StudySidebar } from './StudySidebar'

// 学习区统一布局：桌面左侧固定目录，移动端抽屉式目录
export function StudyLayout({ children, currentDay }: { children: ReactNode; currentDay?: number }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { completed } = useStudyProgressContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-[100dvh]">
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-paper/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setDrawerOpen(true)} className="text-ink/60 lg:hidden" aria-label="打开目录">
            <Menu size={20} />
          </button>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-accent">
            <ArrowLeft size={14} /> 返回首页
          </Link>
          <span className="hidden text-ink/20 sm:inline">/</span>
          <Link to="/study" className="font-display text-sm font-semibold">英语学习计划</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-xs text-ink/50 sm:inline">{user.nickname || user.phone}</span>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1 text-xs text-ink/40 hover:text-accent">
                <LogOut size={14} /> 退出
              </button>
            </>
          ) : (
            <Link to="/login" className="text-xs font-medium text-accent">登录以记录进度</Link>
          )}
        </div>
      </header>

      <div className="flex">
        {/* 桌面固定侧栏 */}
        <div className="sticky top-[65px] hidden h-[calc(100dvh-65px)] w-64 shrink-0 lg:block">
          <StudySidebar completed={completed} currentDay={currentDay} />
        </div>
        {/* 移动端抽屉 */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
              <StudySidebar completed={completed} currentDay={currentDay} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
