import { createContext, useContext, type ReactNode } from 'react'
import { useStudyProgress } from '@/hooks/useStudyProgress'

interface StudyProgressValue {
  completed: number[]
  toggle: (day: number) => Promise<void>
  loading: boolean
  isLoggedIn: boolean
}

const StudyProgressContext = createContext<StudyProgressValue | null>(null)

// 在路由外层提供一次进度状态，让侧栏和页面内容共享同一份数据
export function StudyProgressProvider({ children }: { children: ReactNode }) {
  const value = useStudyProgress()
  return <StudyProgressContext.Provider value={value}>{children}</StudyProgressContext.Provider>
}

export function useStudyProgressContext(): StudyProgressValue {
  const ctx = useContext(StudyProgressContext)
  if (!ctx) throw new Error('useStudyProgressContext must be used within StudyProgressProvider')
  return ctx
}
