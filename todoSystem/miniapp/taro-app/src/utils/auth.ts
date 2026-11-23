import Taro from '@tarojs/taro'
import type { User } from '@/types'

const TOKEN_KEY = 'todosystem_token'
const USER_KEY = 'todosystem_user'

export function getToken(): string | null {
  try {
    return Taro.getStorageSync(TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function getUser(): User | null {
  try {
    return Taro.getStorageSync(USER_KEY) || null
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function setSession(token: string, user: User): void {
  Taro.setStorageSync(TOKEN_KEY, token)
  Taro.setStorageSync(USER_KEY, user)
}

export function logout(): void {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(USER_KEY)
}

export function currentRoute(): string {
  const pages = Taro.getCurrentPages()
  const current = pages[pages.length - 1]
  return current?.route || ''
}

export function goLogin(from?: string): void {
  if (currentRoute() === 'pages/login/index') return
  const query = from ? `?from=${encodeURIComponent(from)}` : ''
  Taro.navigateTo({ url: `/pages/login/index${query}` })
}

/** 核心功能前置守卫：未登录时跳转登录页并返回 false */
export function requireLogin(from?: string): boolean {
  if (isLoggedIn()) return true
  Taro.showToast({ title: '请先登录', icon: 'none' })
  goLogin(from)
  return false
}
