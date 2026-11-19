import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStudyProgress,
  markStudyDayDone,
  unmarkStudyDayDone,
} from '@/api/study'
import { useAuthStore } from '@/stores/auth'

// 统一管理学习进度：游客只读（空进度），登录用户可标记并同步到后端
export function useStudyProgress() {
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const [completed, setCompleted] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setCompleted([])
      return
    }
    getStudyProgress()
      .then((p) => setCompleted(p.completed))
      .catch(() => {})
  }, [token])

  // 标记/取消完成：乐观更新 UI，失败时回退
  const toggle = useCallback(
    async (day: number) => {
      if (!token) {
        navigate('/login')
        return
      }
      const wasDone = completed.includes(day)
      setCompleted((prev) => (wasDone ? prev.filter((d) => d !== day) : [...prev, day]))
      setLoading(true)
      try {
        if (wasDone) await unmarkStudyDayDone(day)
        else await markStudyDayDone(day)
      } catch {
        setCompleted((prev) => (wasDone ? [...prev, day] : prev.filter((d) => d !== day)))
      } finally {
        setLoading(false)
      }
    },
    [token, completed, navigate],
  )

  return { completed, toggle, loading, isLoggedIn: !!token }
}
