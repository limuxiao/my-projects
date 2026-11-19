import { useState, type FormEvent } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '@/api/auth'
import { AuthLayout } from '@/components/AuthLayout'
import { useAuthStore } from '@/stores/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [phone, setPhone] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    // 前端先做一层简单校验，不满足就直接 return，不发请求
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      // nickname 为空字符串时传 undefined，等价于「不传这个选填字段」
      await register({ phone, password, nickname: nickname || undefined })
      // 注册接口只返回用户、不返回 token，所以紧接着调一次登录拿到 token
      const result = await login({ phone, password })
      setSession(result.accessToken, result.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="创建你的账户"
      description="一个手机号，一段密码，就能开始整理你的待办。"
      footer={
        <p>
          已有账户？{' '}
          <Link to="/login" className="font-semibold text-accent underline-offset-4 hover:underline">
            直接登录
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-7" noValidate>
        <div>
          <label className="field-label" htmlFor="phone">手机号</label>
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
          <label className="field-label" htmlFor="nickname">昵称（选填）</label>
          <input
            id="nickname"
            className="field-input"
            type="text"
            maxLength={64}
            placeholder="怎么称呼你"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">密码</label>
          <input
            id="password"
            className="field-input"
            type="password"
            autoComplete="new-password"
            placeholder="至少 8 位"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="confirm">确认密码</label>
          <input
            id="confirm"
            className="field-input"
            type="password"
            autoComplete="new-password"
            placeholder="再输入一次"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? '创建中' : '创建账户'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
