import { create } from 'zustand'
import type { User } from '@/types'

const TOKEN_KEY = 'todosystem_token'

// 定义 store 的「形状」：状态字段 + 修改状态的方法
interface AuthState {
  token: string | null
  user: User | null
  // 函数类型写法：参数列表 => 返回值，void 表示没有返回值
  setSession: (token: string, user: User) => void
  logout: () => void
}

// zustand 的 create 创建一个全局 store，返回一个 Hook
// 组件里用 useAuthStore(selector) 订阅需要的部分，只有那部分变化时才重渲染
export const useAuthStore = create<AuthState>((set) => ({
  // token 从 localStorage 读，刷新页面后登录态还在
  token: localStorage.getItem(TOKEN_KEY),
  // user 不持久化：刷新后为 null，由首页的 getMe 重新拉取（见 HomePage）
  user: null,
  // set 是 zustand 提供的更新函数，传入的对象会合并到现有 state
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, user: null })
  },
}))
