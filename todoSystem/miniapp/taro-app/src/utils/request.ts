import Taro from '@tarojs/taro'
import type { ApiResponse } from '@/types'
import { getToken, goLogin, logout, currentRoute } from './auth'

// 开发期直连后端（对应 frontend 的 /api 代理目标）。
// 用真机预览时把这里改成机器可访问的局域网 IP 或线上域名。
export const API_BASE_URL = 'http://localhost:3099'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
  data?: Record<string, unknown>
}

interface RequestResult<T> {
  statusCode: number
  data: T
}

function normalizeMessage(message: unknown): string {
  if (Array.isArray(message)) return message.join('；')
  if (typeof message === 'string' && message) return message
  return '请求失败'
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const token = getToken()
  const header: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) header.Authorization = `Bearer ${token}`

  let res: RequestResult<ApiResponse<T>>
  try {
    res = await Taro.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header
    })
  } catch {
    throw new Error('网络连接失败，请检查后端服务是否已启动')
  }

  if (res.statusCode === 401) {
    logout()
    const route = currentRoute()
    if (route !== 'pages/login/index' && route !== 'pages/register/index') {
      goLogin()
    }
    throw new Error('登录已过期，请重新登录')
  }

  const body = res.data
  if (!body || (body.code !== 200 && body.code !== 201)) {
    throw new Error(normalizeMessage(body?.message))
  }
  return body.data
}

export function audioUrl(id: number): string {
  return `${API_BASE_URL}/study/words/${id}/audio`
}
