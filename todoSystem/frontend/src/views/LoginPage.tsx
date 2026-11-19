import { useState, type FormEvent } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { AuthLayout } from '@/components/AuthLayout'
import { useAuthStore } from '@/stores/auth'

export function LoginPage() {
  // useNavigate 返回编程式导航函数，用于在逻辑里跳转页面
  const navigate = useNavigate()
  // 从 store 里只取 setSession 方法，取函数不会因状态变化引起无关重渲染
  const setSession = useAuthStore((state) => state.setSession)

  // useState 是 React 最核心的 Hook：返回 [当前值, 修改值的函数]
  // 每次调用 setState，组件会带着新值重新渲染，这就是「状态驱动 UI」
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // async 函数返回 Promise；FormEvent 是 React 的表单事件类型
  async function handleSubmit(event: FormEvent) {
    event.preventDefault() // 阻止表单默认提交导致的页面刷新，改由 JS 处理
    setError('')
    setLoading(true)
    try {
      const result = await login({ phone, password }) // await 等待接口返回
      setSession(result.accessToken, result.user) // 写入全局登录态
      navigate('/', { replace: true }) // 成功后跳首页
    } catch (err) {
      // catch 接住 request 层 reject 出来的 Error，展示给用户
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false) // 无论成功失败都要关闭 loading
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="登录你的账户"
      description="输入手机号与密码，继续你的待办清单。"
      footer={
        <p>
          还没有账户？{' '}
          <Link to="/register" className="font-semibold text-accent underline-offset-4 hover:underline">
            注册一个
          </Link>
        </p>
      }
    >
      {/* noValidate 关掉浏览器自带校验，让错误提示样式由我们统一控制 */}
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <div>
          <label className="field-label" htmlFor="phone">手机号</label>
          {/* 受控组件：value 来自 state，onChange 再把输入写回 state，两者保证输入框和状态同步 */}
          <input
            id="phone"
            className="field-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="13800138000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">密码</label>
          <input
            id="password"
            className="field-input"
            type="password"
            autoComplete="current-password"
            placeholder="至少 8 位"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {/* 条件渲染：error 有值时才渲染这段，&& 左边为假时整个表达式不产生内容 */}
        {error && (
          <p role="alert" className="border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {/* 三元表达式根据 loading 切换图标和文案；请求中禁用按钮防止重复提交 */}
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? '登录中' : '登录'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
