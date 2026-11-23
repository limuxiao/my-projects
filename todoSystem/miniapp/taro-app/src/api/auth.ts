import { request } from '@/utils/request'
import type { LoginDto, LoginResult, RegisterDto, User } from '@/types'

export function login(dto: LoginDto) {
  return request<LoginResult>({ method: 'POST', url: '/auth/login', data: { ...dto } })
}

export function register(dto: RegisterDto) {
  return request<User>({ method: 'POST', url: '/auth/register', data: { ...dto } })
}

export function getMe() {
  return request<User>({ method: 'GET', url: '/users/me' })
}
