import { request } from '@/request'
// 用 import type 导入纯类型：编译时会被擦除，不会产生运行时代码
import type { LoginDto, LoginResult, RegisterDto, User } from '@/types'

// API 层的职责：把「接口调用」集中管理，组件只管调函数、不关心 url 和 method
// request<User> 的泛型参数声明了返回数据的类型，调用处能拿到完整的类型提示
export function register(dto: RegisterDto) {
  return request<User>({ method: 'POST', url: '/auth/register', data: dto })
}

export function login(dto: LoginDto) {
  return request<LoginResult>({ method: 'POST', url: '/auth/login', data: dto })
}

// 不带 data 的 GET 请求，token 由 request 层的拦截器自动带上
export function getMe() {
  return request<User>({ method: 'GET', url: '/users/me' })
}
