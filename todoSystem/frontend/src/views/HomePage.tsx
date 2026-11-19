import { useEffect, useState } from 'react'
import { ArrowUpRight, ListTodo, LogOut, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

export function HomePage() {
  const navigate = useNavigate()
  // 解构 store：user 重命名为 storedUser，避免和下面的局部 state 重名
  const { user: storedUser, logout } = useAuthStore()
  // 用 store 里的用户初始化本地 state；刷新页面时 store 的 user 为 null，需要重新拉取
  const [user, setUser] = useState<User | null>(storedUser)

  // useEffect 处理副作用（请求数据、订阅等），会在组件渲染后执行
  // 依赖数组 [user]：只有 user 变化时才重新执行；user 已有值就跳过请求
  useEffect(() => {
    if (user) return
    // Promise 的 then 处理成功、catch 处理失败
    getMe()
      .then(setUser)
      .catch(() => {
        // 401 已由请求层统一处理并跳转登录，这里无需重复提示
      })
  }, [user])

  // ?. 可选链：user 为 null 时不会报错，而是继续取后面的值
  // || 取第一个「真值」，?? 只在 null/undefined 时用默认值，二者场景不同
  const displayName = user?.nickname || user?.phone || '朋友'
  const initial = displayName.slice(0, 1).toUpperCase()
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    : '—' // 三元表达式：有创建时间就格式化，否则显示占位符

  function handleLogout() {
    logout() // 清掉全局登录态和 localStorage
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-[100dvh]">
      {/* 顶部导航 */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-ink text-paper">
              <ListTodo size={16} strokeWidth={2.2} />
            </div>
            <span className="font-display text-base font-semibold tracking-tight">TodoSystem</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-accent/10 font-display text-sm font-semibold text-accent">
              {initial}
            </div>
            <span className="hidden text-sm text-ink-soft sm:inline">{displayName}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink/50 transition-colors hover:text-accent"
            >
              <LogOut size={14} />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-14 sm:px-10 sm:pt-20">
        {/* 主区：不对称网格，左主右辅 */}
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <section>
            <p className="field-label mb-5 flex items-center gap-2 text-accent">
              <Sparkles size={13} />
              Your workspace
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              你好，{displayName}
              <span className="text-accent">.</span>
              <br />
              今天想完成些什么？
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-ink-soft/70">
              这里是你的私人待办空间。任务按账户独立保存，干净的界面让你专注于事情本身，
              而不是工具。
            </p>

            <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-8 border-t border-ink/10 pt-8 sm:max-w-md">
              <div>
                <p className="field-label mb-2">账户类型</p>
                <p className="font-display text-2xl font-semibold">
                  {user?.role === 'admin' ? '管理员' : '普通用户'}
                </p>
              </div>
              <div>
                <p className="field-label mb-2">会员等级</p>
                <p className="font-display text-2xl font-semibold">L{user?.vipLevel ?? 0}</p>
              </div>
              <div>
                <p className="field-label mb-2">加入时间</p>
                <p className="font-display text-lg font-medium">{joined}</p>
              </div>
              <div>
                <p className="field-label mb-2">账号状态</p>
                <p className="font-display text-lg font-medium">
                  {user?.isActive === false ? '已停用' : '正常'}
                </p>
              </div>
            </div>
          </section>

          {/* 右侧账户卡片，轻微下移制造错落 */}
          <aside className="lg:mt-16">
            <div className="border border-ink/10 bg-paper-deep/40 p-7">
              <p className="field-label mb-6">账户信息</p>
              <dl className="divide-y divide-ink/10 text-sm">
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink/50">手机号</dt>
                  <dd className="font-medium">{user?.phone ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink/50">昵称</dt>
                  <dd className="font-medium">{user?.nickname ?? '未设置'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink/50">邮箱</dt>
                  <dd className="font-medium">{user?.email ?? '未设置'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink/50">实名认证</dt>
                  <dd className="font-medium">
                    {user?.realNameInfo?.verified ? '已认证' : '未认证'}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* 底部工作区预告：用分隔线而非卡片堆叠 */}
        <section className="mt-24 border-t border-ink/10 pt-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="field-label mb-3">Coming next</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">待办清单</h2>
            </div>
            <span className="hidden text-xs text-ink/40 sm:inline">即将开放</span>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: '创建与整理', desc: '记录想法，按自己的节奏安排优先级。' },
              { title: '完成的状态', desc: '用清晰的勾选标记每一件已完成的事。' },
              { title: '私人空间', desc: '每个人只能看到自己的任务，互不干扰。' },
            ].map((item, index) => (
              <div key={item.title} className="border-t border-ink/15 pt-5">
                <span className="font-display text-xs font-semibold text-accent">
                  0{index + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/50">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-2 text-xs text-ink/40">
            <ArrowUpRight size={14} />
            更多功能正在路上
          </div>
        </section>
      </main>
    </div>
  )
}
